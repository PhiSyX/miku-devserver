# Serveur de développement avec Deno

## Créer un exécutable :
```
  deno install --unstable --allow-read --allow-net ./bin/miku-devserver.ts

  --unstable est requis pour pouvoir générer du code typescript à la volé ;
  --allow-read est requis pour pouvoir lire ou créer des fichiers ;
  --allow-net est requis pour pouvoir créer un réseau ;
```

### Lancer l'exécutable
```
  miku-devserver
  miku-devserver --config=./config/config_example.json
  miku-devserver --config=./config/your_config_file.json

  # or miku-devserver.cmd
```

## ROADMAP
1) Créer un serveur HTTP configurable.

    1)  ✔️ Rendre des fichiers statiques, qui eux, seront situés
    dans un répertoire particulier, par exemple "public/".
        Les fichiers de ce répertoire ne seront pas évalués par les points suivants ;

    2)  Lors d'une requête HTTP, dont le __chemin__ de l'adresse se termine par :
        1)  ✔️ __.scss__: renvoi du code SCSS compilé, donc en du code CSS ;

            ```
            ## style.scss (scss) #################### style.scss (css: raw) ########
            #                                 |    |                               #
            # ```scss                         | -> | ```css                        #
            #   $black: #000;                 |    |                               #
            #   body { background: $black; }  |    |   body { background: #000; }  #
            # ```                             | -> | ```                           #
            #                                 |    |                               #
            ########################################################################
            ```

            - si le __header__ de la requête contient `Referer: .../*.{js,ts,jsx,tsx}` et / ou `Sec-Fetch-Dest: script`,
              on doit alors générer du code JavaScript ;

              ```
              ## style.scss (raw) ####################################################################
              #                                                                                      #
              # ```css                                                                               #
              #   body { background: #000; }                                                         #
              # ```                                                                                  #
              #                                                                                      #
              ## main.js ######################## style.scss (js) ####################################
              #                           |    |                                                     #
              # ```js                     | -> | ```js                                               #
              #   import "./style.scss";  |    |   import { updateStyleDom } from "miku-devserver";  #
              #   // ...code              |    |   updateStyleDom("file-id", "./style.scss?raw");    #
              # ```                       | -> | ```                                                 #
              #                           |    |                                                     #
              ################################################################################## DOM #
              #                                                                                      #
              # <link id="miku-css-file-id" rel="stylesheet" type="text/css" href="./style.scss">    #
              #                                                                                      #
              ########################################################################################
              ```

            - On doit trouver un moyen de pouvoir compiler du SCSS en CSS.
              ```
              wasm-pack build --target web --release --out-dir "server/compiler" --out-name "compiler"
              ```

        2)  ✔️ __.json__:

            ```
            ## file.json (raw) ##############
            #                               #
            # ```json                       #
            #   {                           #
            #     "hostname": "localhost",  #
            #     "port": 8080              #
            #   }                           #
            # ```                           #
            #                               #
            #################################
            ```

            - si le __header__ de la requête contient `Referer: .../*.{js,ts,jsx,tsx}` et / ou `Sec-Fetch-Dest: script`,
              on doit alors générer du code JavaScript ;

              ```
              ## file.json (raw) #####################################################
              #                                                                      #
              # ```json                                                              #
              #   {                                                                  #
              #     "hostname": "localhost",                                         #
              #     "port": 8080                                                     #
              #   }                                                                  #
              # ```                                                                  #
              #                                                                      #
              ## main.js ################################ file.json (js) #############
              #                                   |    |                             #
              # ```js                             | -> | ```js                       #
              #   import obj from "./file.json";  |    |   export default {          #
              #   // ...code                      | -> |     hostname: "localhost",  #
              #   console.log(typeof obj, obj);   | -> |     port: 8080              #
              #   console.log(obj.hostname);      |    |   }                         #
              # ```                               | -> | ```                         #
              #                                   |    |                             #
              ############################################################## CONSOLE #
              #                                                                      #
              # > "object", { hostname: "localhost", port: 8080 }                    #
              # > "localhost"                                                        #
              #                                                                      #
              ########################################################################
              ```



        3)  ✔️ __.ts__: renvoi du code TypeScript transpilé, donc en du code JavaScript ;

            ```
            ## main.ts (ts) ######################### main.ts (js: raw) ###############
            #                                 |    |                                  #
            # ```ts                           | -> | ```js                            #
            #   const foo: string = "bar";    |    |   const foo = "bar";             #
            #   const sum = (                 |    |   const sum = (a, b) => a + b;   #
            #     a: number,                  | -> |   console.log(foo, sum(1, 2));   #
            #     b: number                   | -> | ```                              #
            #   ): number => a + b;           |    |                                  #
            #   console.log(foo, sum(1, 2));  |    |                                  #
            # ```                             | -> |                                  #
            #                                 |    |                                  #
            ###########################################################################
            ```

            - On doit trouver un moyen de pouvoir transpiler du TypeScript en JavaScript.

        4)  ✔️  __.{jsx,tsx}__: renvoi du code TypeScript transpilé, donc en du code JavaScript ;

            ```
            ## main.jsx ######################################## main.jsx (js: raw) ###############################
            #                                            |    |                                                   #
            # ```jsx                                     | -> | ```js                                             #
            #   const $el = <div class="foo">bar</div>;  |    |   const $el = h("div", { class: "foo" }, "bar");  #
            #   console.log($el);                        |    |   console.log($el);                               #
            # ```                                        | -> | ```                                               #
            #                                            |    |                                                   #
            #######################################################################################################
            ```

        5) __.vue__: renvoi du code TypeScript transpilé, donc en du code JavaScript ;

            ```
            ## MyComponent.vue ########################################## MyComponent.vue (js: raw) ############################################
            #                                                     |    |                                                                       #
            # ```vue                                              | -> | ```js                                                                 #
            #   <template>                                        |    |   import { ref } from "vue";                                          #
            #     <button @click="add_one">Add +1</button>        |    |   import DOMPurify from "dompurify";                                  #
            #     <button @click="add_two">Add +2</button>        |    |   import { addStyleDom } from "miku-devserver";                       #
            #                                                     |    |                                                                       #
            #     <div>i64_value = {{ i64_value }};</div>         |    |   const file_id = "Unique-ID";                                        #
            #     <div v-html="html_value" />                     |    |   const stylesheet = addStyleDom(file_id, `button { color: red; }`);  #
            #   </template>                                       |    |                                                                       #
            #                                                     | -> |   export function MyComponent(props) {                                #
            #   <script>                                          |    |     const i64_value = ref(0);                                         #
            #     import { ref } from "vue";                      |    |     const html_value = "<strong>ok</strong>";                         #
            #                                                     |    |                                                                       #
            #     const i64_value = ref(0);                       |    |     const add_one = (evt) => i64_value.value += 1;                    #
            #     const html_value = "<strong>ok</strong>";       |    |     const add_two = (evt) => i64_value.value += 2;                    #
            #                                                     |    |                                                                       #
            #     const add_one = (evt) => i64_value.value += 1;  | -> |     return h(                                                         #
            #     const add_two = (evt) => i64_value.value += 2;  |    |       Fragment, null,                                                 #
            #   </script>                                         |    |         h("button", { onClick: add_one }, "Add +1"),                  #
            #                                                     |    |         h("button", { onClick: add_two }, "Add +2"),                  #
            #   <style>                                           |    |         h("div", null, "i64_value = ", i64_value.value, ";"),         #
            #   button { color: red; }                            |    |         h("div", { html: DOMPurify.sanitize(html_value) })            #
            #   </style>                                          |    |      );                                                               #
            # ```                                                 |    |   }                                                                   #
            #                                                     | -> | ```                                                                   #
            #                                                     |    |                                                                       #
            ####################################################################################################################################
            ```

    3)  Lors d'une requête HTTP, n'importer que les ressources (js, css,...) dont la page a besoin (tree shaking);

2) Créer un système de rechargement de module à chaud (HMR) configurable ;

    1) Créer une connexion entre le serveur et le client en utilisant WebSocket ou Server-Sent Events ;

## Branches GIT
  - Ne pas directement travailler sur la branche par défaut (`main`).
  - Utiliser `git flow` quand c'est nécessaire.

## Convention de nommage GIT

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Résumé à l'impératif, présent.
  │       │                  Ne pas doit être capitalisé.
  │       │                  Pas de ponctuation de fin.
  │       │
  │       └─⫸ Portée du commit: optionnel
  │
  └─⫸ Type de commit: [bump|build|chore|docs|feat|fix|perf|refactor|revert|style|test|...]
```

| Type		| Description | Alias(es) |
| ------- | ----------- | --------- |
| **bump**, `V` 			| **Augmentation de la version**; c.-à-d. mise à jour d'une dépendance 														| `Publication`, `[V]ersion` |
| **[d]ocs**,`D` 			| documentation de code 																																					| `Commentaire(s)`, `Clarification`, `Documentation`, `Information`, `README` |
| **[f]eat**, `F` 		| **Création** d'une capacité: mise en place d'une dépendance, d'un test, d'une fonctionnalité 		| `Ajout`, `Addition`, `Implémentation` |
| **fix**, `B` 				| Travaille à l'élaboration d'un code lié aux bogues 																							| `[B]ugfix`, `Hotfix` |
| **[p]erfs**,`P` 		| code plus _performant_ | `Optimizing`, `Optimization` |
| **[r]efactor**,`R` 	| Un changement de code qui **ne corrige pas** de _bogue_ ni n'ajoute de _fonctionnalité_ 				| `Refactoring` |
| **revert**, `U` 		| annulation d'un commit précédent 																																| `[U]ndo`, `Revision`, `Retour`, `Erreur` |
| **[s]tyle**, `S` 		| _espaces blancs, points-virgules, crochet à la ligne, etc..._ 																	| `Style`, `Markup` |
| **[t]est**, `T` 		| _Ajout_ ou _modification_ sur tout ce qui concerne les **tests** 																| `Interopérabilité`, `Stage`, `Unit` |
