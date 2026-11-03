export const phases = [
  { id: 'start', label: 'Empty groups', description: 'Start with no digit-sum groups.' },
  { id: 'group', label: 'Add to group', description: 'Compute the digit sum of the next integer and add it to that group.' },
  { id: 'measure', label: 'Find largest', description: 'Find the size of the largest group.' },
  { id: 'done', label: 'Count largest', description: 'Count how many groups have that largest size.' },
];

export const examples = [
  { label: 'Twenty integers', input: JSON.stringify({ n: 20 }) },
  { label: 'Ten integers', input: JSON.stringify({ n: 10 }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const n = data?.n;
  if (!Number.isInteger(n) || n < 1 || n > 10000) {
    throw new Error('Enter {"n":12} with an integer from 1 to 10000.');
  }
  return { n };
}

const digitSum = value => String(value).split('').reduce((total, d) => total + Number(d), 0);

export function buildTrace({ n }) {
  const sizes = {};
  const frames = [{
    phase: 'start', activeLine: 2, message: 'Start with no groups.',
    snapshot: { value: null, digitSum: null, sizes: {}, largest: null },
  }];
  for (let value = 1; value <= n; value++) {
    const s = digitSum(value);
    sizes[s] = (sizes[s] ?? 0) + 1;
    frames.push({
      phase: 'group', activeLine: 5,
      message: `${value} has digit sum ${s}; that group now has ${sizes[s]} member(s).`,
      snapshot: { value, digitSum: s, sizes: { ...sizes }, largest: null },
    });
  }
  const largest = Math.max(...Object.values(sizes));
  frames.push({
    phase: 'measure', activeLine: 6, message: `The largest group has ${largest} member(s).`,
    snapshot: { value: null, digitSum: null, sizes: { ...sizes }, largest },
  });
  const result = Object.values(sizes).filter(size => size === largest).length;
  frames.push({
    phase: 'done', activeLine: 7, message: `${result} group(s) tie for the largest size; return ${result}.`,
    snapshot: { value: null, digitSum: null, sizes: { ...sizes }, largest },
  });
  return { input: { n }, result, frames };
}

export const code = [
  'FUNCTION countLargestGroup(n)',
  '    sizes ← empty map from digit sum to count',
  '    FOR value FROM 1 TO n',
  '        s ← digit sum of value',
  '        sizes[s] ← sizes[s] + 1',
  '    largest ← maximum size in sizes',
  '    RETURN number of sums whose size equals largest',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def countLargestGroup(n):
    sizes = defaultdict(int)
    for value in range(1, n + 1):
        s = sum(int(d) for d in str(value))
        sizes[s] += 1
    largest = max(sizes.values())
    return sum(1 for size in sizes.values() if size == largest)`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
