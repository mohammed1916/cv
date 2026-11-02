// LeetCode 1198: Find Smallest Common Element in All Rows.
// Keep one pointer per row, each at its smallest value not yet ruled out. If every pointer shows the same value,
// that value is common and smallest. Otherwise the largest pointer value (high) is a lower bound for any common value,
// so every row whose pointer value is below high can drop that value and move on.

// Visualization caps (the draft did not verify official bounds).
const MAX_ROWS = 6;
const MAX_COLS = 10;
const MAX_VALUE = 1000;

const CODE_LINES = [
  'FUNCTION smallestCommonElement(mat)',
  '    pointers ← a zero for each row',
  '    WHILE every pointer is inside its row',
  '        values ← mat[r][pointers[r]] for each row r',
  '        low ← minimum of values; high ← maximum of values',
  '        IF low equals high THEN RETURN low',
  '        FOR each row r',
  '            IF mat[r][pointers[r]] < high THEN advance pointers[r] by one',
  '    RETURN -1',
];

const PY_LINES = [
  'class Solution:',
  '    def smallestCommonElement(self, mat: list[list[int]]) -> int:',
  '        pointers = [0] * len(mat)',
  '        while all(p < len(row) for p, row in zip(pointers, mat)):',
  '            values = [row[p] for p, row in zip(pointers, mat)]',
  '            low, high = min(values), max(values)',
  '            if low == high:',
  '                return low',
  '            for r, row in enumerate(mat):',
  '                if row[pointers[r]] < high:',
  '                    pointers[r] += 1',
  '        return -1',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(Solution().smallestCommonElement(json.loads(sys.stdin.read()))))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Rows', description: 'Start every row pointer at its first value.' },
  { id: 'compare', label: 'Compare heads', description: 'Read the value under each pointer and find the low and high.' },
  { id: 'advance', label: 'Advance', description: 'Rows below the high value cannot hold the answer at that value; move them on.' },
  { id: 'done', label: 'Answer', description: 'Report the common value, or -1 when a row runs out.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const mat = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > MAX_ROWS) throw new Error(`Use a matrix with 1 to ${MAX_ROWS} rows.`);
  const cols = Array.isArray(mat[0]) ? mat[0].length : 0;
  if (cols < 1 || cols > MAX_COLS) throw new Error(`Each row has 1 to ${MAX_COLS} values.`);
  for (const row of mat) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('The matrix must be rectangular.');
    row.forEach((value, j) => {
      if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`Values are integers from 0 to ${MAX_VALUE}.`);
      if (j > 0 && row[j - 1] >= value) throw new Error('Each row must be strictly increasing.');
    });
  }
  return mat.map((row) => [...row]);
}

export function buildTrace(input) {
  const mat = parseInput(input);
  const rows = mat.length;
  const cols = mat[0].length;
  const pointers = Array.from({ length: rows }, () => 0);
  const frames = [];
  frames.push({
    pythonLine: P('pointers = [0] * len(mat)'), phase: 'setup', activeLine: L('pointers ← a zero for each row'),
    pointers: [...pointers], values: null, low: null, high: null, advanced: [], answer: null,
    message: `${rows} row${rows === 1 ? '' : 's'} of ${cols} values, every pointer at its first value.`,
  });
  let answer = -1;
  let found = false;
  while (!found && pointers.every((p) => p < cols)) {
    const values = mat.map((row, r) => row[pointers[r]]);
    const low = Math.min(...values);
    const high = Math.max(...values);
    frames.push({
      pythonLine: P('low, high = min(values)'), phase: 'compare', activeLine: L('low ← minimum of values'),
      pointers: [...pointers], values, low, high, advanced: [], answer: null,
      message: `Heads are ${values.join(', ')}: low ${low}, high ${high}.`,
    });
    if (low === high) {
      answer = low;
      found = true;
      frames.push({
        pythonLine: P('return low'), phase: 'done', activeLine: L('IF low equals high THEN RETURN low'),
        pointers: [...pointers], values, low, high, advanced: [], answer,
        message: `Every row shows ${low}, so ${low} is the smallest common value.`,
      });
      break;
    }
    const advanced = [];
    for (let r = 0; r < rows; r += 1) {
      if (mat[r][pointers[r]] < high) {
        pointers[r] += 1;
        advanced.push(r);
      }
    }
    frames.push({
      pythonLine: P('pointers[r] += 1'), phase: 'advance', activeLine: L('IF mat[r][pointers[r]] < high'),
      pointers: [...pointers], values, low, high, advanced, answer: null,
      message: `Rows ${advanced.map((r) => r + 1).join(', ')} hold a value below ${high}, so they move on.`,
    });
  }
  if (!found) {
    frames.push({
      pythonLine: P('return -1'), phase: 'done', activeLine: L('RETURN -1'),
      pointers: [...pointers], values: null, low: null, high: null, advanced: [], answer: -1,
      message: 'A row ran out of values, so no common element exists.',
    });
  }
  return { input: mat, answer, frames };
}
