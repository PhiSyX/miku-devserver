// Types
import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std@0.89.0/http/server.ts";
import {
  listenAndServe,
  listenAndServeTLS,
} from "https://deno.land/std@0.89.0/http/server.ts";
import type {
  ConfigFileInterface,
  ConfigFileJSON,
} from "../config/config_file.d.ts";

// Standard Library

import {
  blue,
  cyan,
  green,
  red,
  underline,
  yellow,
} from "https://deno.land/std@0.89.0/fmt/colors.ts";

import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.89.0/ws/mod.ts";

// My Modules

import { handleRequest as handleHttpRequest } from "./http.ts";
import { handleRequest as handleWsRequest } from "./ws.ts";

import { watcher } from "./watcher.ts";

export type ServerRequestContext = ServerRequest & { url: URL };
export type ServerResponseContext = ServerResponse & {
  filename?: string;
  path?: string;
};

export interface ResponseRequest {
  raw: string;
  rawStatus: number;
  rawType: string;

  source: string;
  sourceStatus: number;
  sourceType: string;

  mtime: Date;
}

export function createServer(/*mut*/ config: Partial<ConfigFileJSON>) {
  if (!config.env) {
    config.env = "development";
  }

  if (!config.hostname) {
    config.hostname = "0.0.0.0";
  }

  if (!config.port) {
    config.port = 8000;
  }

  if (!config.alias) {
    config.alias = {};
  }

  config.alias["miku-devserver"] = "/~/index.ts";

  const options: Partial<Deno.ListenTlsOptions> = {
    hostname: config.hostname,
    port: config.port,
  };

  if (config.tls) {
    options.certFile = config.tls.cer;
    options.keyFile = config.tls.key;
  }

  listening(config as ConfigFileInterface);

  config.tls
    ? listenAndServeTLS(
      options as Deno.ListenTlsOptions,
      handleServerRequest(config as ConfigFileInterface),
    )
    : listenAndServe(
      options as Deno.ListenOptions,
      handleServerRequest(config as ConfigFileInterface),
    );
}

function getURL(config: ConfigFileInterface) {
  const secure = config.tls ? "s" : "";
  const hostname = config.hostname;

  let /*mut*/ port = config.port.toFixed();
  let /*mut*/ prefixPort = "";
  if (port != "80" && port != "443") {
    prefixPort = ":";
  } else {
    port = "";
  }

  return `http${secure}://${hostname}${prefixPort}${port}/`;
}

function listening(config: ConfigFileInterface) {
  const urlStr = getURL(config);

  console.log(green("✔️"), "", "Le serveur web est lancé:");

  console.log(
    " ".repeat(2),
    blue("-"),
    "Les URL's accessibles via",
    underline(urlStr),
    ":",
  );

  const showPath = (shared_key: string) => {
    const rootUrl = shared_key === "static"
      ? ""
      : config.shared.paths[shared_key];

    const rootPath = (
      Deno.cwd() + "/" +
      config.shared.paths[shared_key]
    ).replaceAll("/", "\\");

    console.log(
      " ".repeat(4),
      blue("-"),
      `[${yellow("*")}]:`,
      `/${rootUrl}${cyan("*")} ${red("->")} ${rootPath}${cyan("*")}`,
    );
  };

  Object
    .keys(config.shared.paths)
    .forEach(showPath);
}

function handleServerRequest(config: ConfigFileInterface) {
  return async (_request: ServerRequest) => {
    const request = defineRequest(config)(_request);

    try {
      if (acceptable(request)) {
        const paths = Object.values(config.shared.paths);
        const sock = await acceptWebSocket({
          conn: request.conn,
          headers: request.headers,
          bufReader: request.r,
          bufWriter: request.w,
        });

        await handleWsRequest(config)(watcher(paths))(sock);
      } else {
        handleHttpRequest(config)(request);
      }
    } catch {
      await request.respond({ status: 400 });
    }
  };
}

function defineRequest(config: ConfigFileInterface) {
  const urlStr = getURL(config);

  return (request: ServerRequest): ServerRequestContext => {
    const url = new URL(request.url, urlStr);
    return Object.assign(request, { url });
  };
}
