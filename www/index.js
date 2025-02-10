import { memory } from "wasm-game-of-rust/wasm_game_of_rust_bg.wasm";
import { Universe, Cell } from "wasm-game-of-rust";

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const canvas = document.querySelector("canvas#game-of-life-canvas");
const ctx = canvas.getContext('2d');

console.log(canvas)

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

canvas.width = (CELL_SIZE * width) * 2;
canvas.height = (CELL_SIZE * height) * 2;
canvas.style.width = `${CELL_SIZE * width}px`;
canvas.style.height = `${CELL_SIZE * height}px`;
const dpi = window.devicePixelRatio;
ctx.scale(dpi, dpi);


const renderLoop = () => {

    universe.tick();

    drawGrid();
    drawCells();

    requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
}


const getIndex = (row, column) => {
    return row * width + column;
};

/**
 * Determines if a cell is alive based on its position in a bit array.
 *
 * @param {number} i - The index of the cell to check.
 * @param {Uint8Array} arr - The array containing the cell states, where each bit represents a cell.
 * @returns {boolean} - True if the cell is alive, otherwise false.
 */

const isAlive = (i, arr) => {
    const byte = Math.floor(i / 8);
    const mask = 1 << (i % 8);
    return (arr[byte] & mask) === mask
}

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height / 8); // array length is:  (width * height / 8) since we have a cell per bit rather than per byte:

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = isAlive(idx, cells) ?
                ALIVE_COLOR :
                DEAD_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};