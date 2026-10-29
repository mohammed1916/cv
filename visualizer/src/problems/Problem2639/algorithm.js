const PYTHON_LINES = [
  "def columnWidths(grid):",
  "    rows = len(grid)",
  "    cols = len(grid[0])",
  "    widths = [0] * cols",
  "    for r in range(rows):",
  "        for c in range(cols):",
  "            widths[c] = max(widths[c], len(str(grid[r][c])))",
  "    return widths",
];

const CODE = [
  "FUNCTION columnWidths(grid)",
  "  rows = number of rows in grid",
  "  cols = number of columns in grid",
  "  widths = array of cols zeros",
  "  FOR each row r from 0 to rows - 1",
  "    FOR each column c from 0 to cols - 1",
  "      widths[c] = MAX(widths[c], length of grid[r][c] as text)",
  "  RETURN widths",
];

const MIN_VALUE = -1000000000;
const MAX_VALUE = 1000000000;
const MAX_DIMENSION = 100;

export function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error('Input must be a JSON object such as {"grid": [[1],[22]]}');
    }
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with a "grid" key');
  }
  const grid = data.grid;
  if (!Array.isArray(grid)) {
    throw new Error('"grid" must be an array of rows');
  }
  if (grid.length < 1 || grid.length > MAX_DIMENSION) {
    throw new Error(`grid must have between 1 and ${MAX_DIMENSION} rows (got ${grid.length})`);
  }
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0;
  if (cols < 1 || cols > MAX_DIMENSION) {
    throw new Error(`each row must have between 1 and ${MAX_DIMENSION} columns (got ${cols})`);
  }
  grid.forEach((row, r) => {
    if (!Array.isArray(row)) throw new Error(`grid[${r}] must be an array`);
    if (row.length !== cols) throw new Error(`grid[${r}] has ${row.length} columns, expected ${cols}`);
    row.forEach((value, c) => {
      if (!Number.isInteger(value)) throw new Error(`grid[${r}][${c}] must be an integer`);
      if (value < MIN_VALUE || value > MAX_VALUE) {
        throw new Error(`grid[${r}][${c}] must be between -10^9 and 10^9`);
      }
    });
  });
  return { grid: grid.map(row => [...row]) };
}

function makeFrame(fields) {
  return {
    phase: fields.phase,
    activeLine: fields.activeLine,
    pythonLine: fields.pythonLine,
    message: fields.message,
    explanation: fields.explanation ?? fields.message,
    grid: fields.grid,
    widths: [...fields.widths],
    r: fields.r ?? null,
    c: fields.c ?? null,
    text: fields.text ?? null,
    length: fields.length ?? null,
    changed: fields.changed ?? false,
    result: fields.result ?? null,
  };
}

export function buildTrace(input) {
  const { grid } = parseInput(input);
  const rows = grid.length;
  const cols = grid[0].length;
  const widths = new Array(cols).fill(0);
  const frames = [];

  frames.push(makeFrame({ phase: "setup", activeLine: 2, pythonLine: 2, grid, widths,
    message: `Read the row count: rows = ${rows}.` }));
  frames.push(makeFrame({ phase: "setup", activeLine: 3, pythonLine: 3, grid, widths,
    message: `Read the column count from the first row: cols = ${cols}.` }));
  frames.push(makeFrame({ phase: "setup", activeLine: 4, pythonLine: 4, grid, widths,
    message: `Start every column width at 0.` }));

  for (let r = 0; r < rows; r++) {
    frames.push(makeFrame({ phase: "row", activeLine: 5, pythonLine: 5, grid, widths, r,
      message: `Row r = ${r}: scan its ${cols} cells.` }));
    for (let c = 0; c < cols; c++) {
      const value = grid[r][c];
      const text = String(value);
      const length = text.length;
      frames.push(makeFrame({ phase: "cell", activeLine: 6, pythonLine: 6, grid, widths, r, c,
        text, length,
        message: `Cell [${r}][${c}] = ${text}, its text length is ${length}.` }));
      const before = widths[c];
      widths[c] = Math.max(before, length);
      const changed = widths[c] !== before;
      frames.push(makeFrame({ phase: "update", activeLine: 7, pythonLine: 7, grid, widths, r, c,
        text, length, changed,
        message: changed
          ? `Column ${c} width grows from ${before} to ${widths[c]}.`
          : `Column ${c} keeps width ${widths[c]}; length ${length} does not exceed it.` }));
    }
  }

  frames.push(makeFrame({ phase: "done", activeLine: 8, pythonLine: 8, grid, widths, result: [...widths],
    message: `Return the widths: [${widths.join(", ")}].` }));

  return { input: { grid }, result: [...widths], frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
