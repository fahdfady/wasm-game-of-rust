use wasm_bindgen_test::*;
wasm_bindgen_test_configure!(run_in_browser);

extern crate wasm_game_of_rust;

use wasm_game_of_rust::Universe;

#[cfg(test)]
pub fn input_spaceship() -> Universe {
    let mut universe = Universe::new();

    universe.set_width(6);
    universe.set_height(6);
    let coordinates: &[(u32, u32)] = &[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)];

    universe.set_cells(coordinates);
    universe
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
    let mut universe = Universe::new();

    universe.set_width(6);
    universe.set_height(6);
    let coordinates: &[(u32, u32)] = &[(2,1), (2,3), (3,2), (3,3), (4,2)];

    universe.set_cells(coordinates);
    universe
}

#[wasm_bindgen_test]
pub fn test_tick() {
    let mut input_universe = input_spaceship();

    // This is what our spaceship should look like
    // after one tick in our universe.
    let expected_universe = expected_spaceship();

    input_universe.tick();

    assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}
