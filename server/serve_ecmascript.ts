import type { ConfigFileInterface } from "../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "./server.ts";

export function serveEcmaScript(config: ConfigFileInterface) {
  return async (
    request: ServerRequestContext,
    response: ServerResponseContext,
  ): Promise<Omit<ResponseRequest, "mtime">> => {
    const { filename, body } = response;

    const raw = "";
    let rawStatus = 500;

    let source = raw;
    let sourceStatus = 202;
    const sourceType = ".js";

    try {
      const output = await Deno.emit(
        request.url.pathname,
        {
          sources: {
            [request.url.pathname]: `${body}`,
          },
          compilerOptions: {
            strict: true,
            sourceMap: false,
            jsx: "react",
            jsxFactory: "h",
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
