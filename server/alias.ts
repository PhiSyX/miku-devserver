import type { Alias } from "../config/config_file.d.ts";

export const ALIAS_ATTR_RE = /(href|src)="([^"]+)"/gi;

export const ALIAS_IMPORT_RE = /import\s(.+)\sfrom\s["`']([^"`']+)['`"]/g;

export const ALIAS_DYN_IMPORT_RE = /import\(["`']([^"`']+)['`"]\)/g;

export function aliasAttr(alias: Alias) {
  return (line: string, match1: string, match2: string): string => {
    const path = alias[match2];
    return path && `${match1}="${path}"` || line;
  };
}

export function aliasImport(alias: Alias) {
  return (line: string, match1: string, match2: string): string => {
    const path = alias[match2];
    return path && `import ${match1} from "${path}"` || line;
  };
}

export function aliasDynImport(alias: Alias) {
  return (line: string, match1: string): string => {
    const path = alias[match1];
    return path && `import("${path}")` || line;
  };
}
