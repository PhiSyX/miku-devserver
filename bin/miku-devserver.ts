import type { ConfigFileJSON } from "../config/config_file.d.ts";

import { readFile } from "../packages/helpers/deno/fs.ts";
import { getCommandArgs } from "../packages/helpers/deno/terminal.ts";

import { createServer } from "../server/server.ts";

interface CommandArgs {
  config?: string;
}

async function getConfig(
  args: CommandArgs,
): Promise<ConfigFileJSON> {
  const fileName = args.config || "./config/config_default.json";
  const encoding = "json";

  return await readFile(
    fileName,
    encoding,
  );
}

// Récupère les arguments de la ligne de commande ;
const commandArgs: CommandArgs = getCommandArgs();

// Récupère le fichier de configuration passé en argument, si existe ;
const /* mut */ fileConfig: ConfigFileJSON = await getConfig(
  commandArgs,
);

// Crée un serveur à partir des informations du fichier de configuration ;
createServer(fileConfig);
