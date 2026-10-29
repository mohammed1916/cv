const CODE = [
  "FUNCTION longestNewString(x, y, z)",
  "    best[i][j][state] ← most AB blocks possible, using i AA and j BB blocks",
  "    best[0][0][empty] ← 0",
  "    answer ← 0",
  "    FOR i FROM 0 TO x",
  "        FOR j FROM 0 TO y",
  "            IF i > 0 THEN append AA from (i − 1, j) when that string does not end in AA",
  "            IF j > 0 THEN append BB from (i, j − 1) when that string is empty or ends in AA",
  "            IF the string here is empty or ends in BB THEN append AB blocks up to z",
  "            answer ← max(answer, 2 × (i + j + most AB blocks))",
  "    RETURN answer",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def longestNewString(x, y, z):
    START, AB, BB, AA = 0, 1, 2, 3
    best = [[[-1] * 4 for _ in range(y + 1)] for _ in range(x + 1)]
    best[0][0][START] = 0
    answer = 0
    for i in range(x + 1):
        for j in range(y + 1):
            if i > 0:
                for st in (START, AB, BB):
                    if best[i - 1][j][st] >= 0:
                        best[i][j][AA] = max(best[i][j][AA], best[i - 1][j][st])
            if j > 0:
                for st in (START, AA):
                    if best[i][j - 1][st] >= 0:
                        best[i][j][BB] = max(best[i][j][BB], best[i][j - 1][st])
            if best[i][j][START] >= 0 or best[i][j][BB] >= 0:
                best[i][j][AB] = z
            answer = max([answer] + [2 * (i + j + k) for k in best[i][j] if k >= 0])
    return answer
`;
export const pythonLineMap = { 1: 1, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 12, 9: 16, 10: 18, 11: 19 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"x": 2, "y": 5, "z": 1}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with keys x, y and z.");
  const { x, y, z } = data;
  for (const [name, v] of [["x", x], ["y", y], ["z", z]]) {
    if (!Number.isInteger(v) || v < 1 || v > 50) throw new Error(`${name} must be an integer from 1 to 50.`);
  }
  return { x, y, z };
}

export function buildTrace(input) {
  const { x, y, z } = input;
  const START = 0, AB = 1, BB = 2, AA = 3;
  const best = Array.from({ length: x + 1 }, () => Array.from({ length: y + 1 }, () => [-1, -1, -1, -1]));
  const rowLabels = Array.from({ length: x + 1 }, (_, i) => `AA=${i}`);
  const columnLabels = Array.from({ length: y + 1 }, (_, j) => `BB=${j}`);
  const table = Array.from({ length: x + 1 }, () => Array(y + 1).fill(null));
  const frames = [];
  let answer = 0;
  best[0][0][START] = 0;
  emit(frames, table, { phase: "setup", line: 3, row: 0, column: 0, value: 0, message: "Empty string: 0 AA, 0 BB and 0 AB blocks, length 0." });
  for (let i = 0; i <= x; i++) {
    for (let j = 0; j <= y; j++) {
      emit(frames, table, { phase: "scan", line: 6, row: i, column: j, value: null, message: `Visit cell AA=${i}, BB=${j}.` });
      if (i > 0) {
        for (const st of [START, AB, BB]) if (best[i - 1][j][st] >= 0) best[i][j][AA] = Math.max(best[i][j][AA], best[i - 1][j][st]);
        emit(frames, table, { phase: "compute", line: 7, row: i, column: j, value: null, message: best[i][j][AA] >= 0 ? `Append AA after the string at (${i - 1}, ${j}); it keeps ${best[i][j][AA]} AB blocks.` : "AA cannot be appended here (the string would end in AAA or the cell is unreachable)." });
      }
      if (j > 0) {
        for (const st of [START, AA]) if (best[i][j - 1][st] >= 0) best[i][j][BB] = Math.max(best[i][j][BB], best[i][j - 1][st]);
        emit(frames, table, { phase: "compute", line: 8, row: i, column: j, value: null, message: best[i][j][BB] >= 0 ? `Append BB after the string at (${i}, ${j - 1}); it keeps ${best[i][j][BB]} AB blocks.` : "BB cannot be appended here (the previous string ends in BB or AB)." });
      }
      if (best[i][j][START] >= 0 || best[i][j][BB] >= 0) best[i][j][AB] = z;
      emit(frames, table, { phase: "compute", line: 9, row: i, column: j, value: null, message: best[i][j][AB] >= 0 ? `Append AB blocks up to z = ${z}.` : "No AB block can follow the string here." });
      const values = best[i][j].filter(k => k >= 0).map(k => 2 * (i + j + k));
      const cell = values.length ? Math.max(...values) : null;
      if (cell !== null) answer = Math.max(answer, cell);
      emit(frames, table, { phase: "compute", line: 10, row: i, column: j, value: cell, message: cell === null ? "Unreachable cell." : `Longest string using AA=${i}, BB=${j} is ${cell}.` }, true);
    }
  }
  emit(frames, table, { phase: "result", line: 11, row: x, column: y, value: answer, message: `Return the longest string length ${answer}.` });
  return { input, result: answer, frames, rowLabels, columnLabels };
}
