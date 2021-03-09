import type { ConfigFileInterface } from "../../config/config_file.d.ts";

import {
  ALIAS_DYN_IMPORT_RE,
  ALIAS_IMPORT_RE,
  aliasDynImport,
  aliasImport,
} from "../alias.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "../server.ts";

export function serveEcmaScript(config: ConfigFileInterface) {
  return async (
    request: ServerRequestContext,
    response: ServerResponseContext,
  ): Promise<Omit<ResponseRequest, "mtime">> => {
    const { filename, body } = response;

    const pathname = request.url.pathname.replaceAll(".vue", ".jsx");

    let raw = "";
    let rawStatus = 500;

    let source = raw;
    let sourceStatus = 202;
    const sourceType = ".js";

    try {
      raw = `${body}`.replaceAll(
        ALIAS_IMPORT_RE,
        aliasImport(config.alias || {}),
      ).replaceAll(
        ALIAS_DYN_IMPORT_RE,
        aliasDynImport(config.alias || {}),
      );
      const output = await Deno.emit(
        pathname,
        {
          sources: {
            [pathname]: raw,
          },
          compilerOptions: {
            strict: true,
            sourceMap: false,
            jsx: "react",
            jsxFactory: "h",
            jsxFragmentFactory: "Fragment",
            removeComments: true,
            target: "es2020",
          },
        },
      );

      rawStatus = 200;
      sourceStatus = 200;

      source = Object.values(output.files)[0];
    } catch (e) {
      console.error();
      console.group(filename, ":");
      console.error(e);
      console.groupEnd();
      console.error();

      const msg = `unable to handle the given specifier: ${request.url.pathname}

        the code source is hidden because it contains a syntax error ;
        fix it, if you are the administrator of this server.
      `;
      source = `throw new ${e.name}(\`${msg}\`)`;
    }

    return {
      raw: source,
      rawStatus,
      rawType: sourceType,

      source,
      sourceType,
      sourceStatus,
    };
  };
}
