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
  ): Promise<Omit<ResponseRequest, "status" | "mtime">> => {
    const { body } = response;

    const code = `${body}`;

    const output = await Deno.emit(
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

    const source = Object.values(output.files)[0];
    const sourceType = ".js";

    return {
      raw: source,
      rawType: sourceType,
      source,
      sourceType,
    };
  };
}
