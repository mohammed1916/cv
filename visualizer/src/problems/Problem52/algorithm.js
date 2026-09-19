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

