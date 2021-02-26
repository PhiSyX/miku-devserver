// deno-lint-ignore-file
/* tslint:disable */
/* eslint-disable */

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
