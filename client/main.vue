<template>
  <main style="padding: 8px; border-radius: 4px">
    <header>
      <h1>It Works !</h1>

      <p>
        Cette page est générée depuis le script "./client/main.vue".
        <br />
        <cite>miku-devserver</cite>
      </p>

      <p>Crée le <time datetime="2021-02-25">25 Février 2021</time></p>

      <label class="theme">
        {{ LIGHT.toUpperCase() }}
        <input
          type="checkbox"
          :checked="isChecked"
          @change="handleChangeInputCheckbox"
        />
        {{ DARK.toUpperCase() }}
      </label>
    </header>
  </main>
</template>

<script>
import { h, Fragment, render } from "preact";
import { useLayoutEffect, useMemo, useState } from "preact/hooks";

import "./main.scss";

const $el$html = document.documentElement;

const DARK = "dark";
const LIGHT = "light";

const $clientApp = document.getElementById("client-js-app");
$clientApp.innerHTML = "";

render(<MainView />, $clientApp);
</script>

<script setup>
const [theme, setTheme] = useState(DARK);

const isChecked = useMemo(() => theme === DARK, [theme]);

/**
 * Change la couleur du thème ;
 * @param {MouseEvent} _evt
 */
function handleChangeInputCheckbox(_evt) {
  setTheme(theme === DARK ? LIGHT : DARK);
}

useLayoutEffect(() => {
  $el$html.dataset["theme"] = theme;
}, [theme]);
</script>

<style>
main {
  background: var(--pre_bg) !important;
}
</style>
