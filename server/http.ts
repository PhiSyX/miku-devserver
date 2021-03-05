// Types
import type { Response as ServerResponse } from "https://deno.land/std@0.89.0/http/server.ts";
import type { ConfigFileInterface } from "../config/config_file.d.ts";
import type { ResponseRequest, ServerRequestContext } from "./server.ts";

// Standard Library

// Third Party Modules
import { contentType } from "https://deno.land/x/media_types@v2.7.1/mod.ts";
import { extname } from "https://deno.land/std@0.89.0/path/mod.ts";

// Mes modules
import { readFile } from "../packages/helpers/deno/fs.ts";
import { cache } from "./memory_cache.ts";
import { serveCss } from "./serve_css.ts";
import { serveJson } from "./serve_json.ts";
import { serveHtml } from "./serve_html.ts";
import { serveEcmaScript } from "./serve_ecmascript.ts";
import { serveVue } from "./serve_vue.ts";

export function handleRequest(config: ConfigFileInterface) {
  return async (request: ServerRequestContext) => {
    if (!config.shared || !config.shared?.paths) {
      throw new Error(
        "Tu dois définir une propriété `shared.paths` dans ton fichier de configuration ; réfère-toi à la configuration par défaut (config/config_default.json) pour mieux visualiser comment la définir.",
      );
    }

    config.shared.paths["~"] = "server/web";

    let response: ResponseRequest;

    const {
      nsKey,
      nsVal,
    } = getNamespace(config)(request.url.pathname);

    if (nsKey && nsVal) {
      response = await sendResourceDynamically(config, {
        namespace: nsKey,
        root: nsVal,
      })(request);
    } else {
      response = await sendResourceStatically(config, {
        namespace: "static",
      })(request);
    }

    const headers = new Headers();

    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "sameorigin");
    headers.set("x-xss-protection", "1; mode=block");

    headers.set(
      "Content-Type",
      !isImportRequest(request)
        ? <string> contentType(response.rawType)
        : <string> contentType(response.sourceType),
    );

    if (response.rawStatus === 301) {
      // TODO: améliorer cette partie
      headers.set("Location", request.url.pathname + "/");
    }

    sendResponse(request, {
      body: !isImportRequest(request) ? response.raw : response.source,
      status: !isImportRequest(request)
        ? response.rawStatus
        : response.sourceStatus,
      headers,
    });
  };
}

function sendResourceDynamically(config: ConfigFileInterface, options: {
  namespace: string;
  root: string;
}) {
  return async (request: ServerRequestContext): Promise<ResponseRequest> => {
    const { filename, status } = await getResource(config, options)(request);

    const stats = await Deno.lstat(filename);

    const url = request.url.pathname;
    if (cache(config).has(url)) {
      const { mtime } = cache(config).get(url) as ResponseRequest;
      if ((<Date> stats.mtime).getTime() > (<Date> mtime).getTime()) {
        cache(config).delete(url);
      } else {
        return cache(config).get(url) as ResponseRequest;
      }
    }

    let raw = "";
    let rawStatus = status;
    let sourceStatus = status;

    try {
      raw = await readFile(filename, "utf-8");
    } catch (e) {
      console.error();
      console.group(filename, ":");
      console.error(e);
      console.groupEnd();
      console.error();
      raw = "PARSE_ERROR : " + e.message;
      rawStatus = 500;
      sourceStatus = 202;
    }

    const rawType = extname(filename);

    let response: ResponseRequest = {
      raw,
      rawStatus,
      rawType,

      source: raw,
      sourceStatus,
      sourceType: rawType,

      mtime: stats.mtime as Date,
    };

    switch (rawType) {
      case ".css":
      case ".scss":
        response = {
          ...response,
          ...(await serveCss(config)(request, { filename, body: raw })),
        };
        break;

      case ".json":
        response = {
          ...response,
          ...(serveJson(config)(request, { filename, body: raw })),
        };
        break;

      case ".js":
      case ".jsx":
      case ".ts":
      case ".tsx":
        response = {
          ...response,
          ...(await serveEcmaScript(config)(request, { filename, body: raw })),
        };
        break;

      case ".vue":
        response = {
          ...response,
          ...(await serveVue(config)(request, { filename, body: raw })),
        };
        break;

      case ".html":
        response = {
          ...response,
          ...(serveHtml(config)(request, { filename, body: raw })),
        };
        break;
    }

    cache(config).set(url, response);

    return cache(config).get(url) as ResponseRequest;
  };
}

function sendResourceStatically(config: ConfigFileInterface, options: {
  namespace: string;
}) {
  return async (request: ServerRequestContext): Promise<ResponseRequest> => {
    const rootDir = config.shared?.paths[options.namespace];

    const { filename, status } = await getResource(config, {
      namespace: options.namespace,
      root: rootDir,
    })(
      request,
    );

    const stats = await Deno.lstat(filename);

    const url = request.url.pathname;
    if (cache(config).has(url)) {
      const { mtime } = cache(config).get(url) as ResponseRequest;
      if ((<Date> stats.mtime).getTime() > (<Date> mtime).getTime()) {
        cache(config).delete(url);
      } else {
        return cache(config).get(url) as ResponseRequest;
      }
    }

    const raw = await readFile(filename);
    const rawType = extname(filename);

    cache(config).set(url, {
      raw,
      rawType,

      source: raw,
      sourceType: rawType,

      status,

      mtime: stats.mtime as Date,
    });

    return cache(config).get(url) as ResponseRequest;
  };
}

function getNamespace(config: ConfigFileInterface) {
  const namespaces = config.shared.paths || {};
  return (pathname: string) => {
    let nsKey = null;
    let nsVal = null;

    for (const namespace in namespaces) {
      if (namespace == "static") continue;

      if (
        pathname.indexOf(`/${namespace}/`) >= 0 || pathname === `/${namespace}`
      ) {
        nsKey = namespace;
        nsVal = namespaces[namespace];
        break;
      }
    }

    return {
      nsKey,
      nsVal,
    };
  };
}

// Retourne une resource existante ou un fichier 404 ;
function getResource(
  _config: ConfigFileInterface,
  options: {
    namespace: string;
    root: string;
  },
) {
  return async (
    request: ServerRequestContext,
  ): Promise<{ filename: string; status: number }> => {
    const index = "index.html";

    let pathname = request.url.pathname
      .replace(new RegExp(`^\/${options.namespace}`), "");

    const rootDir = (options.root || "").replaceAll(/\/$/g, "");

    // URL -> /test/
    if (pathname.slice(-1) === "/") {
      pathname += index;
    }

    // URL -> /test
    let redirectTo = false;
    if (!/\.[\w]+$/.test(pathname)) {
      pathname += "\\" + index;
      redirectTo = true;
    }

    const state = {
      filename: await Deno.realPath("server/web/404.html"),
      status: 404,
    };

    try {
      state.filename = await Deno.realPath(rootDir + pathname);
      state.status = redirectTo ? 301 : 200;
    } catch { /* ? */ }

    return state;
  };
}

const sendResponse = (
  ctx: ServerRequestContext,
  response: ServerResponse,
) => {
  ctx.respond(response);
};

/**
 * Retourne un boolean, true si l'URL est "appelée" à partir d'un import de script, false sinon.
 */
function isImportRequest(request: ServerRequestContext) {
  const cleanUrl = (url: string) => {
    const queryRE = /\?.*$/;
    const hashRE = /\#.*$/;
    return url.replace(hashRE, "").replace(queryRE, "");
  };

  const fetchDest = request.headers.get("sec-fetch-dest") === "script";
  const referer = cleanUrl(request.headers.get("referer") || "");
  const queryRaw = request.url.searchParams.has("raw");
  return !queryRaw && fetchDest || /\.[jt]sx?$/.test(referer);
}
