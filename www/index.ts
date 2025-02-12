import { memory } from "wasm-game-of-rust/wasm_game_of_rust_bg.wasm";
import { Universe, Cell } from "wasm-game-of-rust";

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const canvas: any = document.querySelector("canvas#game-of-life-canvas");
const ctx = canvas.getContext('2d');

console.log(canvas)

const universe = Universe.new();
console.log(universe)
// console.log(universe.toggle_cell(0, 0))
const width = universe.width();
const height = universe.height();

canvas.width = (CELL_SIZE * width);
canvas.height = (CELL_SIZE * height);
canvas.style.width = `${CELL_SIZE * width}px`;
canvas.style.height = `${CELL_SIZE * height}px`;
const dpi = window.devicePixelRatio;
ctx.scale(dpi, dpi);

const playPauseButton: Element | null = document.querySelector("#play-pause");
let animation: number | null = null;

const renderLoop = () => {
    universe.tick();

    drawGrid();
    drawCells();

    animation = requestAnimationFrame(renderLoop);
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

const isAlive = (i: number, arr: Uint8Array<ArrayBuffer>): boolean => {
    const u32Index = Math.floor(i / 32); // divide i by 32 that gives us the index of the 32-bit word (4 bytes)that contains the cell state.
    const byteOffset = (i % 32) >> 3; // the remainder of i/32, then shift by 3 bits to the right to get the byte offset

    const bitinByte = i % 8;

    const byteIndex = u32Index * 4 + byteOffset;
    const mask = 1 << bitinByte;

    return (arr[byteIndex] & mask) !== 0;
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


if (!playPauseButton) throw new Error("Play button not found");

const play = () => {
    playPauseButton.textContent = "||";
    renderLoop();
}

const pause = () => {
    if (!animation) throw new Error("Animation not found");
    playPauseButton.textContent = ">";
    // native javascript api
    cancelAnimationFrame(animation);
    animation = null;
}

const isPaused = () => {
    return animation === null;
}

playPauseButton.addEventListener("click", () => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});


canvas.addEventListener(("click"), e => {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasLeft = (e.clientX - rect.left) * scaleX;
    const canvasTop = (e.clientY - rect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / ((CELL_SIZE + 1))), height - 1);
    const col = Math.min(Math.floor(canvasLeft / ((CELL_SIZE + 1))), width - 1);

    // console.log(row, col)

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();

})