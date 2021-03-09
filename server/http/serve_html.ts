import { Sha1 } from "https://deno.land/std@0.89.0/hash/sha1.ts";

import type { ConfigFileInterface } from "../../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "../server.ts";

import { ALIAS_ATTR_RE, aliasAttr } from "../alias.ts";

export function serveHtml(config: ConfigFileInterface) {
  return (
    request: ServerRequestContext,
    response: ServerResponseContext,
  ): Pick<
    ResponseRequest,
    "raw" | "source"
  > => {
    const { body } = <Required<ServerResponseContext>> response;

    let raw = `${body}`.replace(
      "</head>",
      [
        '  <script type="module" src="miku-devserver"></script>',
        "</head>",
      ].join("\n"),
    )
      .replaceAll(ALIAS_ATTR_RE, aliasAttr(config.alias!))
      .replaceAll(ALIAS_ATTR_RE, handleSource(request));

    return {
      raw,
      source: raw,
    };
  };
}

function handleSource(request: ServerRequestContext) {
  return (all: string, attr: string, src: string): string => {
    let url = request.url.href;
    if (url.endsWith(".html")) {
      url = url.replace(/^(http.+)(\/.+.html)$/, "$1");
    }

    if (src.startsWith("/")) {
      url = request.url.origin + src;
    } else if (src.startsWith(".")) {
      url += "/" + src;
    }

    url = url
      .replaceAll(/\/[.]{1,}\//g, "/") // -> /../ | /./
      .replaceAll(/(?<![:])\/\//g, "/") // -> //main.jsx -> /main.jsx
      .replace(request.url.origin, "");

    const uuid = (new Sha1()).update(
      (Deno.cwd() + url).replaceAll("/", "\\"),
    )
      .toString();

    return `id="miku-uid-${uuid}" ${attr}="${url}"`;
  };
}
