// LeetCode 1088: Confusing Number II.
// Build every valid number from 1 to n digit by digit (digits 0, 1, 6, 8, 9, no leading zero).
// Each number's rotation is built alongside it: the new digit's rotation goes in front of the old rotation.
// A number is confusing when its rotation is a different number.

// Visualization cap (the draft did not verify official bounds).
const MAX_N = 1000;
const DIGITS = [0, 1, 6, 8, 9];
const ROTATE = { 0: 0, 1: 1, 6: 9, 8: 8, 9: 6 };

const CODE_LINES = [
  'FUNCTION confusingNumberII(n)',
  '    ROTATE ← {0 to 0, 1 to 1, 6 to 9, 8 to 8, 9 to 6}',
  '    count ← 0',
  '    explore(x = 0, rot = 0, scale = 1)',
  '    FUNCTION explore(x, rot, scale)',
  '        FOR each digit d in 0, 1, 6, 8, 9',
  '            IF x is 0 and d is 0 THEN CONTINUE',
  '            y ← 10 · x + d',
  '            IF y > n THEN CONTINUE',
  '            r ← ROTATE[d] · scale + rot',
  '            IF r ≠ y THEN count ← count + 1',
  '            explore(y, r, 10 · scale)',
  '    RETURN count',
];

const PY_LINES = [
  'class Solution:',
  '    def confusingNumberII(self, n: int) -> int:',
  '        rotate = {0: 0, 1: 1, 6: 9, 8: 8, 9: 6}',
  '        count = 0',
  '',
  '        def explore(x, rot, scale):',
  '            nonlocal count',
  '            for d in (0, 1, 6, 8, 9):',
  '                if x == 0 and d == 0:',
  '                    continue',
  '                y = 10 * x + d',
  '                if y > n:',
  '                    continue',
  '                r = rotate[d] * scale + rot',
  '                if r != y:',
  '                    count += 1',
  '                explore(y, r, 10 * scale)',
  '',
  '        explore(0, 0, 1)',
  '        return count',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(Solution().confusingNumberII(json.loads(sys.stdin.read()))))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Set the rotation table and start from the empty number.' },
  { id: 'check', label: 'Check candidate', description: 'Append a digit and compare the number with its rotation.' },
  { id: 'prune', label: 'Prune', description: 'The extended number passes n, so every longer number does too.' },
  { id: 'done', label: 'Count', description: 'Report how many visited numbers are confusing.' },
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
  const n = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Number.isInteger(n) || n < 1 || n > MAX_N) throw new Error(`Use an integer n from 1 to ${MAX_N}.`);
  return n;
}

export function buildTrace(input) {
  const n = parseInput(input);
  const nodes = [];
  const frames = [];
  let count = 0;
  frames.push({
    pythonLine: P('rotate = {0: 0'), phase: 'setup', activeLine: L('ROTATE ← {0 to 0'),
    x: null, rot: null, confusing: null, visitedCount: 0, count, message: `Count confusing numbers from 1 to ${n}.`,
  });
  const explore = (x, rot, scale) => {
    for (const d of DIGITS) {
      if (x === 0 && d === 0) continue;
      const y = 10 * x + d;
      if (y > n) {
        frames.push({
          pythonLine: P('if y > n:'), phase: 'prune', activeLine: L('IF y > n'),
          x: y, rot: null, confusing: null, visitedCount: nodes.length, count,
          message: `${y} is above ${n}, so this branch stops here.`,
        });
        continue;
      }
      const r = ROTATE[d] * scale + rot;
      const confusing = r !== y;
      if (confusing) count += 1;
      nodes.push({ value: y, rot: r, confusing });
      frames.push({
        pythonLine: P('r = rotate[d]'), phase: 'check', activeLine: L('r ← ROTATE[d]'),
        x: y, rot: r, confusing, visitedCount: nodes.length, count,
        message: confusing
          ? `${y} rotates to ${r}, a different number, so it counts (${count} so far).`
          : `${y} rotates to ${r}, the same number, so it does not count.`,
      });
      explore(y, r, 10 * scale);
    }
  };
  explore(0, 0, 1);
  frames.push({
    pythonLine: P('return count'), phase: 'done', activeLine: L('RETURN count'),
    x: null, rot: null, confusing: null, visitedCount: nodes.length, count,
    message: `${count} confusing number${count === 1 ? '' : 's'} from 1 to ${n}.`,
  });
  return { input: n, answer: count, count, nodes, frames };
}
