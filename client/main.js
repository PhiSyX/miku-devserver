import { h, render } from "preact";
import { useEffect, useState } from "preact/hooks";

import fileJSON from "./file.json";
import "./main.scss";

const $el$html = document.documentElement;

const DARK = "dark";
const LIGHT = "light";

function ClientApp() {
  const [theme, setTheme] = useState(DARK);

  console.log(fileJSON);

  /**
   * Change la couleur du thème ;
   * @param {MouseEvent} _evt
   */
  function handleChangeInputCheckbox(_evt) {
    setTheme(theme === DARK ? LIGHT : DARK);
  }

  useEffect(() => {
    $el$html.dataset["theme"] = theme;
  }, [theme]);

  return (
    h(
      "main",
      null,
      h(
        "header",
        null,
        h("h1", null, "It Works !"),
        h(
          "p",
          null,
          'Cette page est générée depuis le script "./client/main.js".',
          h("br", null),
          h("cite", null, "miku-devserver"),
        ),
        h(
          "p",
          null,
          "Crée le",
          h("time", { datetime: "2021-02-25" }, " ", "25 Février 2021", " "),
        ),
        h(
          "label",
          { className: "theme" },
          "LIGHT",
          h("input", {
            id: "js-theme",
            type: "checkbox",
            checked: theme === DARK,
            onChange: handleChangeInputCheckbox,
          }),
          "DARK",
        ),
      ),
      h(
        "p",
        null,
        "La destination de ce répertoire est définie dans la configuration du fichier `./config/config_example.json`",
        h(
          "pre",
          null,
          "shared.paths.",
          h("code", { className: "hl" }, "client"),
        ),
      ),
      h(
        "pre",
        null,
        "$ cat ./config/config_example.json",
        h(
          "code",
          null,
          `

{
  ...
  "shared": {
    "paths": {
      ...
      `,
          h("code", { class: "hl" }, `"client"`),
          `: `,
          h("code", { class: "hl" }, `"client/"`),
          `
    }
  }
}`,
        ),
      ),
    )
  );
}

const $clientApp = document.getElementById("client-js-app");
$clientApp.innerHTML = "";

render(
  h(ClientApp),
  $clientApp,
);
