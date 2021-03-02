
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* Compiler du code SASS/SCSS avec les options par défaut
* @see https://docs.rs/grass/0.10.4/grass/
* @param {string} source
* @param {any} _opts
* @returns {string}
*/
export function sass_compile(source, _opts) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.sass_compile(retptr, ptr0, len0, addHeapObject(_opts));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
}

/**
* Parser du code HTML à partir d'une chaîne de caractère
* @param {string} source
* @returns {Document}
*/
export function html_parse(source) {
    var ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.html_parse(ptr0, len0);
    return Document.__wrap(ret);
}

/**
*/
export class Document {

    static __wrap(ptr) {
        const obj = Object.create(Document.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_document_free(ptr);
    }
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
    constructor(html) {
        var ptr0 = passStringToWasm0(html, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.document_load(ptr0, len0);
        return Document.__wrap(ret);
    }
    /**
    * **Returns** the root `Element`
    * @returns {Element}
    */
    get root() {
        var ret = wasm.document_root(this.ptr);
        return Element.__wrap(ret);
    }
}
/**
*/
export class Element {

    static __wrap(ptr) {
        const obj = Object.create(Element.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_element_free(ptr);
    }
    /**
    * **Returns** the name as a `string` for this `Element`
    * @returns {string}
    */
    get name() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.element_name(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * **Returns** a `Map<string, string>` containing the attributes for this
    * `Element`
    * @returns {Map<string, string>}
    */
    get attributes() {
        var ret = wasm.element_attributes(this.ptr);
        return takeObject(ret);
    }
    /**
    * **Returns** a `string` representation of the `Element`, with it's
    * descendants
    * @returns {string}
    */
    get html() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.element_html(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * **Returns** a `string` of the inner content of this `Element`
    * @returns {string}
    */
    get inner_html() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.element_inner_html(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * **Returns** a js array of type `Array<string>`, which contains all of
    * the descending text nodes
    * @returns {Array<string>}
    */
    text() {
        var ret = wasm.element_text(this.ptr);
        return takeObject(ret);
    }
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
    query(query_str) {
        var ptr0 = passStringToWasm0(query_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.element_query(this.ptr, ptr0, len0);
        return takeObject(ret);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_e6d2c6a38c5eab51 = function() {
        var ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_4f8c0f25d0a2e7c9 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_new_30b46705f07bd888 = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_c2c7d7b6152187c1 = function(arg0, arg1, arg2) {
        getObject(arg0).push(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_push_256965efdc6294aa = function(arg0, arg1) {
        getObject(arg0).push(Element.__wrap(arg1));
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

