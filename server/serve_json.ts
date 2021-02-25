import type { ConfigFileInterface } from "../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "./server.ts";

export function serveJson(_config: ConfigFileInterface) {
  return async (
    _request: ServerRequestContext,
    response: ServerResponseContext,
  ): Promise<Pick<ResponseRequest, "raw" | "source" | "sourceType">> => {
    const { body } = <Required<ServerResponseContext>> response;

    // Le body retourne un object JS quand il s'agit d'un JSON (readFile)
    const raw = JSON.stringify(body); // On doit le rendre en chaîne de caractère

    return {
      raw,
      source: `export default ${raw}`,
      sourceType: ".js",
    };
  };
}
