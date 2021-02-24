// Standard Library

import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std@0.88.0/http/server.ts";

import { extname } from "https://deno.land/std@0.88.0/path/mod.ts";

import {
  listenAndServe,
  listenAndServeTLS,
} from "https://deno.land/std@0.88.0/http/server.ts";

import {
  blue,
  cyan,
  green,
  red,
  underline,
  yellow,
} from "https://deno.land/std@0.88.0/fmt/colors.ts";

// Third Party Modules

import { contentType } from "https://deno.land/x/media_types@v2.7.1/mod.ts";

// My Modules

import type { OBJECT } from "../packages/helpers/shared/types.d.ts";

import { readFile } from "../packages/helpers/deno/fs.ts";

import type {
  ConfigFileInterface,
  ConfigFileJSON,
} from "../config/config_file.d.ts";

export type ServerRequestContext = ServerRequest & { url: URL };

export interface ResponseRequest {
  raw: string;
  rawType: string;

  status: number;
}

export async function createServer(/*mut*/ config: Partial<ConfigFileJSON>) {
  if (!config.env) {
    config.env = "development";
  }

  if (!config.hostname) {
    config.hostname = "0.0.0.0";
  }

  if (!config.port) {
    config.port = 8000;
  }

  const options: Partial<Deno.ListenTlsOptions> = {
    hostname: config.hostname,
    port: config.port,
  };

  if (config.tls) {
    options.certFile = config.tls.cert;
    options.keyFile = config.tls.cert;
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
  let /*mut*/ prefix_port = "";
  if (port != "80" && port != "443") {
    prefix_port = ":";
  } else {
    port = "";
  }

  return `http${secure}://${hostname}${prefix_port}${port}/`;
}

function listening(config: ConfigFileInterface) {
  const url_str = getURL(config);

  console.log(green("✔️"), "", "Le serveur web est lancé:");

  console.log(
    " ".repeat(2),
    blue("-"),
    "Les URL's accessibles via",
    underline(url_str),
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
  return (_request: ServerRequest) => {
    const request = defineRequest(config)(_request);
    handleRequest(config)(request);
  };
}

function defineRequest(config: ConfigFileInterface) {
  const url_str = getURL(config);

  return (request: ServerRequest): ServerRequestContext => {
    const url = new URL(request.url, url_str);
    return Object.assign(request, { url });
  };
}

function handleRequest(config: ConfigFileInterface) {
  return async (request: ServerRequestContext) => {
    if (!config.shared || !config.shared?.paths?.static) {
      throw new Error(
        "Tu dois définir une propriété `shared.paths.static` dans ton fichier de configuration ; réfère-toi à la configuration par défaut (config/config_default.json) pour mieux visualiser comment la définir.",
      );
    }

    const response = await sendResourceStatic(config)(request);

    const headers = new Headers();
    headers.set("X-Powered-By", `miku-devserver`);
    headers.set(
      "Content-Type",
      <string> contentType(response.rawType),
    );

    sendResponse(request, {
      body: response.raw,
      status: response.status,
      headers,
    });
  };
}

function sendResourceStatic(config: ConfigFileInterface) {
  return async (request: ServerRequestContext): Promise<ResponseRequest> => {
    const { filename, status } = await getResource(config)(request);

    const raw = await readFile(filename);
    const rawType = extname(filename);

    return {
      raw,
      rawType,

      status,
    };
  };
}

// Retourne une resource existante ou un fichier 404 ;
function getResource(config: ConfigFileInterface) {
  return async (request: ServerRequestContext) => {
    const index = "index.html";

    let pathname = request.url.pathname;

    // URL -> /test/
    if (pathname.slice(-1) === "/") {
      pathname += index;
    }

    // URL -> /test
    if (!/\.[\w]+$/.test(pathname)) {
      pathname += "/" + index;
    }

    let static_dir = config.shared?.paths.static
      .replaceAll(/\/$/g, "");

    try {
      const state = {
        filename: await Deno.realPath(static_dir + "/404.html"),
        status: 404,
      };

      try {
        state.filename = await Deno.realPath(static_dir + pathname);
        state.status = 200;
      } catch {}

      return state;
    } catch {
      let failed_directory = Deno.cwd() + "\\" + static_dir;

      throw new Error(
        `Vérifie que le chemin de \`shared.paths.static\` est le bon: "${failed_directory}".`,
      );
    }
  };
}

const sendResponse = async (
  ctx: ServerRequestContext,
  response: ServerResponse,
) => {
  ctx.respond(response);
};
