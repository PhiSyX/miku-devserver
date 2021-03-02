/* tslint:disable */
/* eslint-disable */
/**
* Compiler du code SASS/SCSS avec les options par défaut
* @see https://docs.rs/grass/0.10.4/grass/
* @param {string} source
* @param {any} _opts
* @returns {string}
*/
export function sass_compile(source: string, _opts: any): string;
/**
* Parser du code HTML à partir d'une chaîne de caractère
* @param {string} source
* @returns {Document}
*/
export function html_parse(source: string): Document;
/**
*/
export class Document {
  free(): void;
/**
* **Takes** the raw HTML as a string, and **returns** a new `Document` 
*
* # Example
* ```
* const doc = new Document('<html><h1>Hello world!</h1></html>');
* // => Document { root: Element }
* ```
* @param {string} html
*/
  constructor(html: string);
/**
* **Returns** the root `Element`
* @returns {Element}
*/
  readonly root: Element;
}
/**
*/
export class Element {
  free(): void;
/**
* **Returns** a js array of type `Array<string>`, which contains all of 
* the descending text nodes
* @returns {Array<string>}
*/
  text(): Array<string>;
/**
* **Takes** a query `string` and **returns** an `Array<Element>` 
* containing all descending elements matching the selector
*
* # Examples
* ```
* const doc = new Document(...);
* doc.root.query('li');
* // => [ 
* //      Element { name: 'li', ... },
*         Element { name: 'li', ... },
*         ... 
*       ]
* ```
* @param {string} query_str
* @returns {Array<Element>}
*/
  query(query_str: string): Array<Element>;
/**
* **Returns** a `Map<string, string>` containing the attributes for this 
* `Element`
* @returns {Map<string, string>}
*/
  readonly attributes: Map<string, string>;
/**
* **Returns** a `string` representation of the `Element`, with it's 
* descendants
* @returns {string}
*/
  readonly html: string;
/**
* **Returns** a `string` of the inner content of this `Element`
* @returns {string}
*/
  readonly inner_html: string;
/**
* **Returns** the name as a `string` for this `Element`
* @returns {string}
*/
  readonly name: string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly sass_compile: (a: number, b: number, c: number, d: number) => void;
  readonly html_parse: (a: number, b: number) => number;
  readonly __wbg_document_free: (a: number) => void;
  readonly document_load: (a: number, b: number) => number;
  readonly document_root: (a: number) => number;
  readonly __wbg_element_free: (a: number) => void;
  readonly element_name: (a: number, b: number) => void;
  readonly element_attributes: (a: number) => number;
  readonly element_html: (a: number, b: number) => void;
  readonly element_inner_html: (a: number, b: number) => void;
  readonly element_text: (a: number) => number;
  readonly element_query: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        