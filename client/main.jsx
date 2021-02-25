import { h, render } from "https://cdn.skypack.dev/preact";
import { useEffect, useState } from "https://cdn.skypack.dev/preact/hooks";

import fileJSON from "./file.json";

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
    <main>
      <header>
        <h1>It Works !</h1>
        <p>
          Cette page est générée depuis le script "./client/main.jsx".
          <br />
          <cite>miku-devserver</cite>
        </p>

        <p>
          Crée le <time datetime="2021-02-25">25 Février 2021</time>
        </p>

        <label className="theme">
          LIGHT
          <input
            type="checkbox"
            checked={theme === DARK}
            onChange={handleChangeInputCheckbox}
          />
          DARK
        </label>
      </header>

      <p>
        La destination de ce répertoire est définie dans la configuration du
        fichier `./config/config_default.json`
        <pre>
          shared.paths.<code className="hl">static</code>
        </pre>
      </p>

      <pre>
        $ cat ./config/config_default.json
        {"\n\n"}

        <code
          dangerouslySetInnerHTML={{
            __html: `{
  "env": "development",
  "shared": {
    "paths": {
      <code class="hl">"static"</code>: "public/"
    }
  }
}`,
          }}
        />
      </pre>
    </main>
  );
}

render(
  h(ClientApp),
  document.getElementById("client-js-app"),
);
