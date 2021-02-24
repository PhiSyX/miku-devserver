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
  let file_name = args.config || "./config/config_default.json";
  let encoding = "json";

  return await readFile(
    file_name,
    encoding,
  );
}

// Récupère les arguments de la ligne de commande ;
const command_args: CommandArgs = getCommandArgs();

// Récupère le fichier de configuration passé en argument, si existe ;
const /* mut */ file_config: ConfigFileJSON = await getConfig(
  command_args,
);

// Crée un serveur à partir des informations du fichier de configuration ;
createServer(file_config);
