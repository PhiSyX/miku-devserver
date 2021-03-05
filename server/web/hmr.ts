import { updateStyleDom } from "./dom.ts";

export function hmr() {
  const useTls = (location.protocol === "https:" ? "s" : "");
  const socketProtocol = `ws${useTls}`;
  const socketUrl = `${socketProtocol}://${location.host}/~/hmr.ts`;
  const socket = new WebSocket(socketUrl);

  socket.addEventListener("message", function ({ data }) {
    const parsedData = JSON.parse(data);

    if (Array.isArray(parsedData)) return;

    const { uuid, path } = parsedData;

    switch (parsedData.action) {
      case "style-update":
        updateStyleDom(uuid, path);
        break;

      case "full-reload":
        location.reload();
        break;
    }
  });

  socket.addEventListener("close", () => {
    location.reload();
  });

  socket.addEventListener("open", () => {
    console.log("[miku-devserver]: rechargement de fichier activé.");
  });
}
