export const phases = [
  { id: 'count', label: 'Count values', description: 'Tally how many times each value appears.' },
  { id: 'scan', label: 'Next candidate', description: 'Visit the next distinct value in ascending order.' },
  { id: 'check', label: 'Compare count', description: 'A value is lucky when its count equals the value itself.' },
  { id: 'done', label: 'Return best', description: 'Return the largest lucky value, or -1 if none exists.' },
];

export const examples = [
  { label: 'Two is lucky', input: JSON.stringify({ arr: [2, 2, 3, 4] }) },
  { label: 'None lucky', input: JSON.stringify({ arr: [6, 6, 6, 2] }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const arr = data?.arr;
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 500 || arr.some(v => !Number.isInteger(v) || v < 1 || v > 500)) {
    throw new Error('Enter {"arr":[...]} with 1 to 500 integers, each from 1 to 500.');
  }
  return { arr };
}

export function buildTrace({ arr }) {
  const tally = new Map();
  arr.forEach(v => tally.set(v, (tally.get(v) ?? 0) + 1));
  const candidates = [...tally.keys()].sort((a, b) => a - b).map(value => ({ value, count: tally.get(value) }));
  const frames = [{
    phase: 'count', activeLine: 2, message: `Count occurrences: ${candidates.length} distinct value(s).`,
    snapshot: { candidates, current: -1, best: -1, lucky: null },
  }];
  let best = -1;
  candidates.forEach((c, index) => {
    frames.push({
      phase: 'scan', activeLine: 4, message: `Next candidate ${c.value}, which appears ${c.count} time(s).`,
      snapshot: { candidates, current: index, best, lucky: null },
    });
    const lucky = c.count === c.value;
    if (lucky && c.value > best) best = c.value;
    frames.push({
      phase: 'check', activeLine: 5,
      message: lucky ? `${c.value} appears ${c.count} time(s), so it is lucky. Best is now ${best}.`
        : `${c.value} appears ${c.count} time(s), so it is not lucky.`,
      snapshot: { candidates, current: index, best, lucky },
    });
  });
  frames.push({
    phase: 'done', activeLine: 6, message: `Return ${best}.`,
    snapshot: { candidates, current: -1, best, lucky: null },
  });
  return { input: { arr }, result: best, frames };
}

export const code = [
  'FUNCTION findLucky(arr)',
  '    counts ← occurrences of each value in arr',
  '    best ← −1',
  '    FOR EACH value IN distinct values, ascending',
  '        IF counts[value] = value AND value > best THEN best ← value',
  '    RETURN best',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def findLucky(arr):
    counts = Counter(arr)
    best = -1
    for value in sorted(counts):
        if counts[value] == value and value > best:
            best = value
    return best`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
