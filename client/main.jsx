import { h, render } from "https://cdn.skypack.dev/preact";
import { useEffect, useState } from "https://cdn.skypack.dev/preact/hooks";

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
        fichier `./config/config_example.json`
        <pre>
          shared.paths.<code className="hl">client</code>
        </pre>
      </p>

      <pre>
        $ cat ./config/config_example.json
        {"\n\n"}

        <code
          dangerouslySetInnerHTML={{
            __html: `{
  ...
  "shared": {
    "paths": {
      ...
      <code class="hl">"client"</code>: <code class="hl">"client/"</code>
    }
  }
}`,
          }}
        />
      </pre>
    </main>
  );
}

const $clientApp = document.getElementById("client-js-app");
$clientApp.innerHTML = "";

render(
  <ClientApp />,
  $clientApp,
);
