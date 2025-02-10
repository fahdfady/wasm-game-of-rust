mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

extern crate fixedbitset;
use fixedbitset::FixedBitSet;

#[wasm_bindgen]
#[repr(u8)] // each cell is represented as a single byte.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

// fixed-sized universe.
// this makes infinite patterns, like gliders, that reach the end of the universe are snuffed out.
#[wasm_bindgen]
pub struct Universe {
    pub width: u32,  // 8*4
    pub height: u32, // 8*4
    cells: FixedBitSet,
}

// formula to find the array index of the cell inside of the universe
//  index(row, column, universe) = row * width of universe + column

#[allow(dead_code)]
#[warn(unused_variables)]
#[wasm_bindgen]
impl Universe {
    pub fn width(&self) -> u32 {
        self.width
    }
    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr() as *const u32
    }

    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        let universe_size = (self.width * self.height) as usize;

        self.cells = FixedBitSet::with_capacity(universe_size);
    }

    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        let universe_size = (self.width * self.height) as usize;

        self.cells = FixedBitSet::with_capacity(universe_size);
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    /// Public methods are exported to JavaScript.
    pub fn tick(&mut self) {
        let mut next: FixedBitSet = self.cells.clone();

        for row in 0..self.height {
            for column in 0..self.width {
                let index: usize = self.get_index(row, column);
                let cell = self.cells[index];

                let live_neighbors = self.live_neighbor_count(row, column);

                next.set(
                    index,
                    match (cell, live_neighbors) {
                        // frst rule: Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
                        (true, x) if x < 2 => false,
                        // second rule: Any live cell with two or three live neighbours lives on to the next generation.
                        (true, 2) | (true, 3) => true,
                        // third rule: Any live cell with more than three live neighbours dies, as if by overpopulation.
                        (true, x) if x > 3 => false,
                        // fourth rule: Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                        (false, 3) => true,

                        // all other cells remain in the same state.
                        (otherwise, _) => otherwise,
                    },
                )
            }
        }

        self.cells = next;
    }

    pub fn new() -> Universe {
        let width: u32 = 64;
        let height: u32 = 64;

        let universe_size = (width * height) as usize;

        let mut cells: FixedBitSet = FixedBitSet::with_capacity(universe_size);

        for i in 0..universe_size {
            cells.set(i, js_sys::Math::random() < 0.5);
        }

        Universe {
            width,
            height,
            cells,
        }
    }
}

// testing, not exposed to js
impl Universe {
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    pub fn set_cells(&mut self, coordinates: &[(u32, u32)]) {
        for (row, col) in coordinates {
            let index = self.get_index(*row, *col);

            self.cells.set(index, true);
        }
    }
}
