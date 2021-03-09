import type { ConfigFileInterface } from "../../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "../server.ts";

export function serveJson(_config: ConfigFileInterface) {
  return (
    _request: ServerRequestContext,
    response: ServerResponseContext,
  ): Omit<
    ResponseRequest,
    "mtime" | "rawType"
  > => {
    const { body } = <Required<ServerResponseContext>> response;

    // Le body retourne un object JS quand il s'agit d'un JSON (readFile)
    let raw = body; // On doit le rendre en chaîne de caractère
    let rawStatus = 500;

    let source = raw;
    let sourceStatus = 202;

    try {
      if (raw.toString().startsWith("PARSE_ERROR")) {
        raw = JSON.parse(raw.toString());
      }

      raw = JSON.stringify(raw);
      rawStatus = 200;

      source = `export default ${raw}`;
      sourceStatus = 200;
    } catch (e) {
      const msg = `${raw.toString().replace("PARSE_ERROR : ", "")}

        the code source is hidden because it contains a syntax error ;
        fix it, if you are the administrator of this server.
      `;

      raw = "";
      source = [
        `export default undefined;`,
        "",
        `console.error("${e.name}", \`${msg}\`);`,
      ].join("\n");
    }

    return {
      raw,
      source,
      sourceType: ".js",
      rawStatus,
      sourceStatus,
    };
  };
}
