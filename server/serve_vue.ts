import { encode } from "https://deno.land/std@0.89.0/encoding/base64.ts";
import { Sha1 } from "https://deno.land/std@0.89.0/hash/sha1.ts";

import type { Nullable, OBJECT } from "../packages/helpers/shared/types.d.ts";
import type { ConfigFileInterface } from "../config/config_file.d.ts";

import type {
  ResponseRequest,
  ServerRequestContext,
  ServerResponseContext,
} from "./server.ts";

import { firstEntry, lastEntry } from "../packages/helpers/shared/array.ts";
import { _upr, capitalize } from "../packages/helpers/shared/string.ts";

import init, {
  Document,
  html_parse as htmlParse,
} from "./compiler/compiler.js";

import { serveCss } from "./serve_css.ts";
import { serveEcmaScript } from "./serve_ecmascript.ts";

export function serveVue(config: ConfigFileInterface) {
  return async (
    request: ServerRequestContext,
    response: ServerResponseContext,
  ): Promise<Omit<ResponseRequest, "mtime">> => {
    const { filename, body } = <Required<ServerResponseContext>> response;

    const wasmFile = await Deno.readFile("server/compiler/compiler_bg.wasm");
    const wasmEncoded = encode(wasmFile);
    const wasmSource = Uint8Array.from(
      atob(wasmEncoded),
      (c) => c.charCodeAt(0),
    );

    await init(wasmSource);

    const uniqID = JSON.stringify(
      (new Sha1()).update(filename).toString(),
    );

    const document = htmlParse(`${body}`);
    const scripts = getScriptsFrom(document);
    const template = getTemplateFrom(document);

    const styles = getStylesFrom(document);
    const computedStyles = (
      await serveCss(config)(request, {
        ...response,
        body: styles,
      })
    ).raw;

    const code = buildCode(
      uniqID,
      request.url.pathname,
      template,
      scripts,
      computedStyles,
    );

    const output = (
      await serveEcmaScript(config)(request, {
        ...response,
        body: code,
      })
    );

    return output;
  };
}

function getTemplateFrom(document: Document) {
  const $els = document.root.query("template");

  if ($els.length === 0) {
    return "";
  }

  let temp = $els[0].inner_html;
  temp = updateAttribute$interpolation(temp);

  temp = updateAttribute$vBIND(temp);
  temp = updateAttribute$vHTML(temp);

  temp = updateAttribute$FOR(temp);
  temp = updateAttribute$ClassName(temp);

  temp = voidElements(temp);
  temp = slotContent(temp);

  return temp;
}

function slotContent(template: string) {
  return template
    .replace(
      /<slot\s?\/>|<slot><\/slot>/g,
      "{ typeof children !== 'undefined' ? children : props && props.children }",
    );
}

function voidElements(template: string) {
  return template.replaceAll(
    /<(area|base|basefont|bgsound|br|col|embed|frame|hr|img|input|keygen|link|meta|param|source|track|wbr)([^>]*)>/g,
    "<$1$2/>",
  );
}

/**
 * Interpolation
 */
function updateAttribute$interpolation(template: string): string {
  return template
    // attr="{ test: true }" -> attr={ test: true }
    .replaceAll('"{', "{")
    .replaceAll('}"', "}")
    // <p>{{ test }}</p> -> <p>{ test }</p>
    .replaceAll("{{", "{")
    .replaceAll("}}", "}");
}

/**
 * @attribute `v-bind`
 * @example ```
 *   v-bind="props" |> { ...props }
 * ```
 */
function updateAttribute$vBIND(template: string): string {
  return template
    .replace(/v-bind="([^"]+)"/g, "{ ...$1 }")
    .replace(/\s([:@])([^=]+)="([^"]+)"/g, function (_, $1, $2, $3) {
      let temp = "";

      if ($1 === "@") {
        temp = `on${$2[0].toUpperCase() + $2.slice(1)}={${$3}}`;
      } else {
        temp = `${$2}={${$3}}`;
      }

      return " " + temp;
    });
}
/**
 * @attribute v-html
 */
function updateAttribute$vHTML(template: string): string {
  return template
    // v-html="variable" -> dangerouslySetInnerHTML={ { __html: variable } }
    .replace(
      /v-html="([^"]+)"/g,
      "dangerouslySetInnerHTML={ { __html: $1 } }",
    );
}

/**
 * @attribute for
 */
function updateAttribute$FOR(template: string): string {
  return template.replace(/(?<!v\-)for=/g, "htmlFor=");
}

/**
 * @attribute class
 */
function updateAttribute$ClassName(template: string): string {
  return template.replace(/class=/g, "className=");
}

function getScriptsFrom(document: Document) {
  const $els = document.root.query("script");

  const source: OBJECT<Nullable<string>> = {
    normal: null,
    setup: null,
  };

  $els.forEach(($el) => {
    if (typeof $el.attributes.get("setup") === "string") {
      source.setup = $el.inner_html
        .replaceAll("&gt;", ">")
        .replaceAll("&lt;", "<");
    } else {
      source.normal = $el.inner_html
        .replaceAll("&gt;", ">")
        .replaceAll("&lt;", "<");
    }
  });

  return source;
}

function getStylesFrom(document: Document) {
  const $els = document.root.query("style");

  const source = $els.reduce((acc, $style) => {
    return acc + "\n\n" + $style.inner_html;
  }, "");

  return source;
}

function buildCode(
  uniqID: string,
  pathname: string,
  template: string,
  script: OBJECT<Nullable<string>>,
  style: string,
) {
  let source = "";

  if (script.normal) {
    source = script.normal;
  }

  if (style.length > 0) {
    source += `
import { addStyleDom } from "miku-devserver";
addStyleDom(${uniqID}, \`${"\n" + style.replaceAll("\`", "\\`")}\`);
    `;
  }

  let [last] = lastEntry(pathname.split("/"));
  let part = last?.split(".");
  let [first] = firstEntry(part!);
  let name = first || pathname;
  if (name[0] === _upr(name[0])) {
    name += "component";
  } else {
    name += "-view";
  }

  name = capitalize(name).replaceAll("-", "");

  if (script.setup) {
    source += `
export function ${name}(props) {
  ${script.setup}

  return (<>${template}</>);
}
    `;
  } else {
    source += `
export function ${name}(props) {
  return (<>${template}</>);
}
    `;
  }

  return source;
}
