mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_aloloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// imports the `window.alert` javascript function
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

// exports a `greet` rust function
#[wasm_bindgen]
pub fn greet(name: &str) {
    let message = format!("Hello, {} ,wasm-game-of-rust!", name);
    alert(message.as_str());
}
