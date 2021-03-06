import { updateLinkDom, updateScriptDom } from "./dom.ts";

const socketUrl = import.meta.url.replace("http", "ws");

const socket = new WebSocket(socketUrl);

socket.addEventListener("message", function ({ data }) {
  const parsedData = JSON.parse(data);

  if (Array.isArray(parsedData)) return;

  const { uuid, path } = parsedData;

  switch (parsedData.action) {
    case "link-update":
      updateLinkDom(uuid, path);
      break;

    case "script-update":
      updateScriptDom(uuid, path);
      break;

    case "full-reload":
      location.reload();
      break;
  }
});

socket.addEventListener("close", () => location.reload());

socket.addEventListener("open", () => {
  console.log("[miku-devserver]: rechargement de fichier activé.");
});
