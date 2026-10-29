const PYTHON_LINES = [
  "def rowAndMaximumOnes(mat):",
  "    best_row, best_count = 0, -1",
  "    for i in range(len(mat)):",
  "        count = sum(mat[i])",
  "        if count > best_count:",
  "            best_row, best_count = i, count",
  "    return [best_row, best_count]",
];

const CODE = [
  "FUNCTION rowAndMaximumOnes(mat)",
  "  best_row = 0, best_count = -1",
  "  FOR each row index i from 0 to number of rows - 1",
  "    count = number of ones in mat[i]",
  "    IF count > best_count",
  "      best_row = i, best_count = count",
  "  RETURN [best_row, best_count]",
];

const MAX_DIMENSION = 100;

export function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error('Input must be a JSON object such as {"mat": [[0,1],[1,0]]}');
    }
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with a "mat" key');
  }
  const mat = data.mat;
  if (!Array.isArray(mat)) {
    throw new Error('"mat" must be an array of rows');
  }
  if (mat.length < 1 || mat.length > MAX_DIMENSION) {
    throw new Error(`mat must have between 1 and ${MAX_DIMENSION} rows (got ${mat.length})`);
  }
  const cols = Array.isArray(mat[0]) ? mat[0].length : 0;
  if (cols < 1 || cols > MAX_DIMENSION) {
    throw new Error(`each row must have between 1 and ${MAX_DIMENSION} columns (got ${cols})`);
  }
  mat.forEach((row, r) => {
    if (!Array.isArray(row)) throw new Error(`mat[${r}] must be an array`);
    if (row.length !== cols) throw new Error(`mat[${r}] has ${row.length} columns, expected ${cols}`);
    row.forEach((value, c) => {
      if (value !== 0 && value !== 1) throw new Error(`mat[${r}][${c}] must be 0 or 1`);
    });
  });
  return { mat: mat.map(row => [...row]) };
}

function makeFrame(fields) {
  return {
    phase: fields.phase,
    activeLine: fields.activeLine,
    pythonLine: fields.pythonLine,
    message: fields.message,
    explanation: fields.explanation ?? fields.message,
    mat: fields.mat,
    counts: [...fields.counts],
    i: fields.i ?? null,
    count: fields.count ?? null,
    bestRow: fields.bestRow ?? -1,
    bestCount: fields.bestCount ?? -1,
    updated: fields.updated ?? false,
    result: fields.result ?? null,
  };
}

export function buildTrace(input) {
  const { mat } = parseInput(input);
  const rows = mat.length;
  // counts[i] is -1 until row i has been counted.
  const counts = new Array(rows).fill(-1);
  const frames = [];
  let bestRow = 0;
  let bestCount = -1;

  frames.push(makeFrame({ phase: "setup", activeLine: 2, pythonLine: 2, mat, counts, bestRow, bestCount,
    message: "Start with no best row: best_row = 0, best_count = -1." }));

  for (let i = 0; i < rows; i++) {
    frames.push(makeFrame({ phase: "row", activeLine: 3, pythonLine: 3, mat, counts, i, bestRow, bestCount,
      message: `Row ${i}: next row to examine.` }));
    const count = mat[i].reduce((sum, value) => sum + value, 0);
    counts[i] = count;
    frames.push(makeFrame({ phase: "count", activeLine: 4, pythonLine: 4, mat, counts, i, count, bestRow, bestCount,
      message: `Row ${i} has ${count} ones.` }));
    const better = count > bestCount;
    frames.push(makeFrame({ phase: "compare", activeLine: 5, pythonLine: 5, mat, counts, i, count, bestRow, bestCount,
      message: better
        ? `${count} > ${bestCount}: row ${i} beats the best so far.`
        : `${count} is not greater than ${bestCount}: keep row ${bestRow} (ties keep the earlier row).` }));
    if (better) {
      bestRow = i;
      bestCount = count;
      frames.push(makeFrame({ phase: "update", activeLine: 6, pythonLine: 6, mat, counts, i, count, bestRow, bestCount,
        updated: true,
        message: `Best is now row ${bestRow} with ${bestCount} ones.` }));
    }
  }

  frames.push(makeFrame({ phase: "done", activeLine: 7, pythonLine: 7, mat, counts, bestRow, bestCount,
    result: [bestRow, bestCount],
    message: `Return [${bestRow}, ${bestCount}].` }));

  return { input: { mat }, result: [bestRow, bestCount], frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
