import { encode } from "https://deno.land/std@0.88.0/encoding/base64.ts";
import { Sha1 } from "https://deno.land/std@0.88.0/hash/sha1.ts";

import init, { sass_compile as sassCompile } from "./compiler/compiler.js";

import type { ConfigFileInterface } from "../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "./server.ts";

export function serveCss(_config: ConfigFileInterface) {
  return async (
    request: ServerRequestContext,
    response: ServerResponseContext,
  ): Promise<Omit<ResponseRequest, "mtime">> => {
    const { filename, body } = <Required<ServerResponseContext>> response;

    const uniqID = JSON.stringify(
      (new Sha1()).update(filename).toString(),
    );

    const wasmFile = await Deno.readFile("server/compiler/compiler_bg.wasm");
    const wasmEncoded = encode(wasmFile);
    const wasmSource = Uint8Array.from(
      atob(wasmEncoded),
      (c) => c.charCodeAt(0),
    );

    await init(wasmSource);

    let raw = "";
    let rawStatus = 500;

    let source = raw;
    let sourceStatus = 202;

    try {
      raw = sassCompile(`${body}`, {});
      rawStatus = 200;

      source = `
      import { updateStyleDom } from "/~/dom.ts";
      updateStyleDom(${uniqID}, "${request.url.pathname}?t=${Date.now()}");
      `;
      sourceStatus = 200;
    } catch (e) {
      console.error();
      console.group(filename, ":");
      console.error(e);
      console.groupEnd();
      console.error();

      const msg = `${e.name} - ${e.message}: ${request.url.pathname}

        the code source is hidden because it contains a syntax error ;
        fix it, if you are the administrator of this server.
      `;

      source = [
        `console.error("[rust]", \`${msg}\`);`,
      ].join("\n");
    }

    return {
      raw,
      rawType: ".css",
      source,
      sourceType: ".js",
      rawStatus,
      sourceStatus,
    };
  };
}
