export const phases = [
  { id: 'check', label: 'Length check', description: 'Every palindrome needs at least one character, so k cannot exceed the string length.' },
  { id: 'tally', label: 'Count odd letters', description: 'Count letters whose total frequency is odd; each needs its own palindrome centre.' },
  { id: 'decide', label: 'Compare', description: 'Feasible when odd letters are at most k.' },
];

export const examples = [
  { label: 'Two odd letters, k = 4', input: JSON.stringify({ s: 'xyzz', k: 4 }) },
  { label: 'Too many odd letters', input: JSON.stringify({ s: 'abcde', k: 2 }) },
  { label: 'Even counts', input: JSON.stringify({ s: 'aabbcc', k: 3 }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const s = data?.s, k = data?.k;
  if (typeof s !== 'string' || s.length < 1 || s.length > 200 || !/^[a-z]+$/.test(s)) {
    throw new Error('Enter {"s":"...","k":2} where s has 1 to 200 lowercase letters.');
  }
  if (!Number.isInteger(k) || k < 1 || k > 200) {
    throw new Error('k must be an integer from 1 to 200.');
  }
  return { s, k };
}

export function buildTrace({ s, k }) {
  const frames = [];
  const counts = {};
  frames.push({
    phase: 'check', activeLine: 2, message: `Check whether k = ${k} can exceed the length ${s.length}.`,
    snapshot: { k, length: s.length, counts: {}, odd: 0, letter: null, result: null },
  });
  if (k > s.length) {
    frames.push({
      phase: 'decide', activeLine: 2, message: `k = ${k} is larger than ${s.length}, so it is impossible. Return false.`,
      snapshot: { k, length: s.length, counts: {}, odd: 0, letter: null, result: false },
    });
    return { input: { s, k }, result: false, frames };
  }
  let odd = 0;
  for (const letter of [...new Set(s)]) {
    counts[letter] = s.split(letter).length - 1;
    if (counts[letter] % 2 === 1) odd++;
    frames.push({
      phase: 'tally', activeLine: 3,
      message: `${letter} occurs ${counts[letter]} time(s), ${counts[letter] % 2 ? 'odd' : 'even'}; odd letters so far: ${odd}.`,
      snapshot: { k, length: s.length, counts: { ...counts }, odd, letter, result: null },
    });
  }
  const result = odd <= k;
  frames.push({
    phase: 'decide', activeLine: 4,
    message: `${odd} odd letter(s) against k = ${k}: ${result ? 'feasible' : 'not feasible'}.`,
    snapshot: { k, length: s.length, counts: { ...counts }, odd, letter: null, result },
  });
  return { input: { s, k }, result, frames };
}

export const code = [
  'FUNCTION canConstructKPalindromes(s, k)',
  '    IF k > length(s) THEN RETURN false',
  '    odd ← number of letters whose frequency is odd',
  '    RETURN odd ≤ k',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def canConstructKPalindromes(s, k):
    if k > len(s):
        return False
    odd = sum(1 for c in set(s) if s.count(c) % 2 == 1)
    return odd <= k`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5 };
