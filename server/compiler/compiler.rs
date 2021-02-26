use grass::{self, from_string};

use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
/// Compiler du code SASS/SCSS avec les options par défaut
/// @see https://docs.rs/grass/0.10.4/grass/
pub fn sass_compile(source: &str, _opts: JsValue) -> Result<String, JsValue> {
    let sass = from_string(source.to_string(), &grass::Options::default());
    Ok(sass.unwrap())
}
