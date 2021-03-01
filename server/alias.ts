export const ALIAS_IMPORT_RE = /import\s(.+)\sfrom\s["`']([^"`']+)['`"]/g;

export const ALIAS_DYN_IMPORT_RE = /import\(["`']([^"`']+)['`"]\)/g;

export function aliasImport(alias: { [p: string]: string }) {
  return (line: string, match1: string, match2: string): string => {
    const p = alias[match2];
    if (p) {
      return `import ${match1} from "${p}"`;
    }
    return line;
  };
}

export function aliasDynImport(alias: { [p: string]: string }) {
  return (line: string, match1: string): string => {
    const p = alias[match1];
    if (p) {
      return `import("${p}")`;
    }
    return line;
  };
}
