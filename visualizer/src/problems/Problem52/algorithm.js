export const NQUEENSII_PATTERNS = ['check', 'done', 'init', 'place', 'remove', 'skip', 'solution']

export const LINE_PATTERN_MAP = {
  7: 'solution',
  9: 'check',
  10: 'skip',
  11: 'place',
  12: 'place',
  13: 'remove',
}

export const SOLUTION_CODE = [
  { line: 1,  text: "def totalNQueens(n):" },
  { line: 2,  text: "    cols, diag1, diag2 = set(), set(), set()" },
  { line: 3,  text: "    count = 0" },
  { line: 4,  text: "    def backtrack(row):" },
  { line: 5,  text: "        nonlocal count" },
  { line: 6,  text: "        if row == n:" },
  { line: 7,  text: "            count += 1; return" },
  { line: 8,  text: "        for col in range(n):" },
  { line: 9,  text: "            if col in cols or (row-col) in diag1 or (row+col) in diag2:" },
  { line: 10, text: "                continue  # under attack" },
  { line: 11, text: "            cols.add(col); diag1.add(row-col); diag2.add(row+col)" },
  { line: 12, text: "            backtrack(row + 1)" },
  { line: 13, text: "            cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)" },
  { line: 14, text: "    backtrack(0)" },
  { line: 15, text: "    return count" },
];


export function generateSteps(n) {
  if (!Number.isInteger(n) || n < 1 || n > 9) throw new Error("Use an integer n from 1 to 9.");
  const steps = [];
  let eventCount = 0;
  const record = frame => {
    eventCount++;
    if (steps.length < 12000 || frame.done) steps.push({ ...frame, boardRef: board.map(row => [...row]) });
  };
  const board = Array.from({ length: n }, () => Array(n).fill("."));
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  let count = 0;

  record({
    activeLine: 3,
    row: 0, col: -1, phase: "init", solutions: 0,
    message: `Start N-Queens II for n=${n}. Empty board, count=0.`,
  });

  function backtrack(row) {
    if (row === n) {
      count++;
      record({
        activeLine: 7,
        row, col: -1, phase: "solution", solutions: count,
        message: `✓ Solution #${count} found! Increment count.`,
      });
      return;
    }
    for (let col = 0; col < n; col++) {
      record({
        activeLine: 9,
        row, col, phase: "check", solutions: count,
        message: `Row ${row}, Col ${col}: check attacks`,
      });
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        record({
          activeLine: 10,
          row, col, phase: "skip", solutions: count,
          message: `(${row},${col}) under attack — skip`,
        });
        continue;
      }
      board[row][col] = "Q";
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      record({
        activeLine: 11,
        row, col, phase: "place", solutions: count,
        message: `Place Queen at (${row},${col})`,
      });
      backtrack(row + 1);
      board[row][col] = ".";
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
      record({
        activeLine: 13,
        row, col, phase: "remove", solutions: count,
        message: `Backtrack: remove Queen from (${row},${col})`,
      });
    }
  }

  backtrack(0);
  record({
    activeLine: 15,
    row: -1, col: -1, phase: "done", solutions: count, done: true,
    message: `Done! Found ${count} solution(s) for ${n}-Queens II.`,
  });
  steps.truncated = eventCount > steps.length;
  return steps;
}


// ---- N-Queens II (statement-sourced; see scratch statements/52.md) ----
export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('Use an integer board size from 1 to 6 (the visualization caps the size).')
  return n
}

export function buildTrace(n) {
  const cols = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), row: 0, col: null, count: 0, message: `Place ${n} queens, one per row, on a ${n} by ${n} board.` }]
  const safe = (row, col) => cols.every((c, r) => c !== col && Math.abs(c - col) !== row - r)
  const place = row => {
    if (row === n) {
      count++
      frames.push({ phase: 'solution', activeLine: L('if row equals n then add 1 to count and stop'), row, col: null, count, message: `All ${n} rows have a queen. Solution ${count}.` })
      return
    }
    for (let col = 0; col < n; col++) {
      if (!safe(row, col)) {
        frames.push({ phase: 'conflict', activeLine: L('if the square at row and col is safe then'), row, col, count, message: `Column ${col} in row ${row} is attacked by an earlier queen.` })
        continue
      }
      cols[row] = col
      frames.push({ phase: 'place', activeLine: L('put a queen there'), row, col, count, message: `Place a queen at row ${row}, column ${col}.` })
      place(row + 1)
      cols.length = row
    }
  }
  place(0)
  frames.push({ phase: 'done', activeLine: L('return count'), row: n, col: null, count, message: `${count} distinct solutions.` })
  return { input: n, result: count, frames }
}

export const code = `count n-queens solutions (n):
  set count to 0
  call place with row 0
  return count

place(row):
  if row equals n then add 1 to count and stop
  for each column col from 0 to n - 1:
    if the square at row and col is safe then
      put a queen there
      call place with row + 1
      take the queen back

square is safe:
  no earlier queen shares the column or a diagonal`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_n_queens(n):
    cols = []
    count = 0

    def safe(row, col):
        for r, c in enumerate(cols):
            if c == col or abs(c - col) == row - r:
                return False
        return True

    def place(row):
        nonlocal count
        if row == n:
            count += 1
            return
        for col in range(n):
            if safe(row, col):
                cols.append(col)
                place(row + 1)
                cols.pop()

    place(0)
    return count
`
