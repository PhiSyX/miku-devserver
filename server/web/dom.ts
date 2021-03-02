// deno-lint-ignore-file
/* tslint:disable */
/* eslint-disable */

export function addStyleDom(id: string, source: string) {
  const styleId = `miku-style-${id}`;

  let $style = document.getElementById(styleId);
  if (!$style) {
    $style = document.createElement("style");
    $style.id = styleId;
    $style.setAttribute("type", "text/css");

    document.head.appendChild($style);
  }

  $style.textContent = source;
}

export function updateStyleDom(id: string, url: string) {
  const linkId = `miku-css-${id}`;

  let $link = document.getElementById(linkId);
  if (!$link) {
    $link = document.createElement("link");
    $link.id = linkId;
    $link.setAttribute("rel", "stylesheet");
    $link.setAttribute("type", "text/css");

    document.head.appendChild($link);
  }

  $link.setAttribute("href", url);
}
