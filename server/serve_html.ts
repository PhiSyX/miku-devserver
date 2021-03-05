import type { ConfigFileInterface } from "../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "./server.ts";

import {
  ALIAS_DYN_IMPORT_RE,
  ALIAS_IMPORT_RE,
  aliasDynImport,
  aliasImport,
} from "./alias.ts";

export function serveHtml(config: ConfigFileInterface) {
  return (
    _request: ServerRequestContext,
    response: ServerResponseContext,
  ): Pick<
    ResponseRequest,
    "raw" | "source"
  > => {
    const { body } = <Required<ServerResponseContext>> response;

    let raw = `${body}`.replace(
      "</head>",
      [
        '  <script type="module">',
        '    import { hmr } from "miku-devserver";',
        "    hmr();",
        "  </script>",
        "</head>",
      ].join("\n"),
    )
      .replaceAll(
        ALIAS_IMPORT_RE,
        aliasImport(config.alias || {}),
      ).replaceAll(
        ALIAS_DYN_IMPORT_RE,
        aliasDynImport(config.alias || {}),
      );

    return {
      raw,
      source: raw,
    };
  };
}
