import { Sha1 } from "https://deno.land/std@0.89.0/hash/sha1.ts";
import { extname } from "https://deno.land/std@0.89.0/path/mod.ts";

export function watcher(paths: string | string[]) {
  return async (onChange: Function) => {
    const times = new Map();
    const iterator = Deno.watchFs(paths, { recursive: true });

    for await (const event of iterator) {
      if (event.kind !== "modify") {
        continue;
      }

      const fullPath = event.paths[0];
      const ts = Date.now();
      const path = fullPath.replace(Deno.cwd() + "\\", "/") + "?t=" + ts;
      const prevTime = times.get(fullPath);
      const uuid = (new Sha1()).update(fullPath.replaceAll("/", "\\"))
        .toString();
      const ext = extname(fullPath);

      if (prevTime + 1000 < ts || !prevTime) {
        let action = "full-reload";
        switch (ext) {
          case ".css":
          case ".scss":
            action = "style-update";
            break;
        }

        onChange({
          action,
          path,
          uuid,
        });
      }
      times.set(fullPath, ts);
    }
  };
}
