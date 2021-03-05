import type { WebSocket } from "https://deno.land/std@0.89.0/ws/mod.ts";
import type { ConfigFileInterface } from "../config/config_file.d.ts";

import { isWebSocketCloseEvent } from "https://deno.land/std@0.89.0/ws/mod.ts";

const clients: Map<number, WebSocket> = new Map();

export function handleRequest(_config: ConfigFileInterface) {
  return (watcher: (onChange: Function) => void) => {
    return async (sock: WebSocket) => {
      clients.set(sock.conn.rid, sock);

      watcher((payload: object) => {
        for (const [rid, ws] of clients) {
          if (rid === sock.conn.rid) {
            ws.send(JSON.stringify(payload));
          }
        }
      });

      for await (const evt of sock) {
        if (isWebSocketCloseEvent(evt)) {
          clients.delete(sock.conn.rid);
        }
      }
    };
  };
}
