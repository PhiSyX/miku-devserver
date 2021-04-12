// deno-lint-ignore-file
/* tslint:disable */
/* eslint-disable */

export function addStyleDom(id: string, source: string) {
  const styleID = `miku-style-${id}`;

  let $style = document.getElementById(styleID);
  if (!$style) {
    $style = document.createElement("style");
    $style.id = styleID;
    $style.setAttribute("type", "text/css");

    document.head.appendChild($style);
  }

  $style.textContent = source;
}

export function addLinkDom(id: string, url: string) {
  const linkID = `miku-uid-${id}`;
  let $link = document.getElementById(linkID);
  if (!$link) {
    $link = document.createElement("link");
    $link.id = linkID;
    $link.setAttribute("rel", "stylesheet");
    $link.setAttribute("type", "text/css");
    document.head.appendChild($link);
  }
  $link.setAttribute("href", url);
}

export function updateLinkDom(id: string, url: string) {
  addLinkDom(id, url);
}

export function updateScriptDom(id: string, url: string) {
  const scriptID = `miku-uid-${id}`;

  let $script = document.getElementById(scriptID);
  if ($script) {
    let type = $script.getAttribute("type");
    $script.remove();

    $script = document.createElement("script");
    $script.id = scriptID;
    $script.setAttribute("type", type || "module");
    $script.setAttribute("src", url);

    document.body.appendChild($script);
  }
}
