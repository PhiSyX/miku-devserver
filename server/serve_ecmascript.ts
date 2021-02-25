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
  ): Promise<Omit<ResponseRequest, "status">> => {
    const { body } = response;

    let code = `${body}`;

    let output = await Deno.emit(
      request.url.pathname,
      {
        sources: {
          [request.url.pathname]: code,
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

    let source = Object.values(output.files)[0];
    let sourceType = ".js";

    return {
      raw: source,
      rawType: sourceType,
      source,
      sourceType,
    };
  };
}
