import type { ConfigFileInterface } from "../config/config_file.d.ts";

const cachedResource = new Map<string, unknown>();

export const cache = (config: ConfigFileInterface) => ({
  delete(key: string): boolean {
    return cachedResource.delete(key);
  },

  get(key: string): unknown | undefined {
    const content = cachedResource.get(key);

    if (config.cache === false) {
      cachedResource.delete(key);
    }

    return content;
  },

  has(key: string) {
    return config.cache === true && cachedResource.has(key);
  },

  set(key: string, value: unknown) {
    cachedResource.set(key, value);
  },
});
