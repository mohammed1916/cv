// LeetCode 1121: Divide Array Into Increasing Sequences.
// Let f be the largest number of equal values. Each equal value needs its own sequence, so at least f
// sequences are needed, and each must hold k elements: the answer is false when n < k * f.
// Otherwise deal the array round-robin into f sequences. Equal values sit f or more positions apart,
// so every sequence strictly increases and the shortest one has floor(n / f) >= k elements.

// Visualization caps (the draft did not verify official bounds).
const MAX_LENGTH = 16;
const MAX_VALUE = 1000;
const MAX_K = 16;

const CODE_LINES = [
  'FUNCTION canDivide(nums, k)',
  '    n ← length of nums',
  '    f ← largest number of equal values in nums',
  '    IF n < k × f THEN RETURN false',
  '    lanes ← f empty sequences',
  '    FOR i from 0 to n - 1',
  '        append nums[i] to lanes[i mod f]',
  '    FOR each lane',
  '        IF lane is not strictly increasing or is shorter than k THEN RETURN false',
  '    RETURN true',
];

const PY_LINES = [
  'from collections import Counter',
  '',
  'class Solution:',
  '    def canDivideIntoIncreasingSequences(self, nums: list[int], k: int) -> bool:',
  '        n = len(nums)',
  '        f = max(Counter(nums).values())',
  '        if n < k * f:',
  '            return False',
  '        lanes = [[] for _ in range(f)]',
  '        for i in range(n):',
  '            lanes[i % f].append(nums[i])',
  '        for lane in lanes:',
  '            if len(lane) < k or any(lane[j] >= lane[j + 1] for j in range(len(lane) - 1)):',
  '                return False',
  '        return True',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().canDivideIntoIncreasingSequences(data["nums"], data["k"])))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Input', description: 'Read the nondecreasing array and k.' },
  { id: 'count', label: 'Count values', description: 'Find the largest group of equal values.' },
  { id: 'check', label: 'Size check', description: 'Compare n with k times the largest group.' },
  { id: 'deal', label: 'Deal', description: 'Deal each element into one of f sequences in order.' },
  { id: 'verify', label: 'Verify', description: 'Confirm each sequence is strictly increasing and long enough.' },
  { id: 'done', label: 'Answer', description: 'Report whether the array can be divided.' },
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
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.');
  const { nums, k } = data;
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} values.`);
  for (let i = 0; i < nums.length; i += 1) {
    if (!Number.isInteger(nums[i]) || nums[i] < 0 || nums[i] > MAX_VALUE) throw new Error(`nums values are integers from 0 to ${MAX_VALUE}.`);
    if (i > 0 && nums[i] < nums[i - 1]) throw new Error('nums must be nondecreasing.');
  }
  if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`);
  return { nums: [...nums], k };
}

function tally(nums) {
  const counts = new Map();
  for (const value of nums) counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}

export function buildTrace(input) {
  const { nums, k } = parseInput(input);
  const n = nums.length;
  const frames = [];
  frames.push({
    pythonLine: P('n = len(nums)'), phase: 'setup', activeLine: L('n ← length of nums'),
    counts: null, f: null, lanes: null, dealt: -1, lane: null, verdict: null, n, k,
    message: `${n} value${n === 1 ? '' : 's'} and k = ${k}.`,
  });
  const counts = tally(nums);
  let f = 0;
  let mode = null;
  for (const [value, count] of counts) {
    if (count > f) f = count;
  }
  frames.push({
    pythonLine: P('f = max(Counter'), phase: 'count', activeLine: L('f ← largest number of equal values'),
    counts: Object.fromEntries(counts), f, lanes: null, dealt: -1, lane: null, verdict: null, n, k,
    message: `The largest group of equal values has ${f} member${f === 1 ? '' : 's'}.`,
  });
  if (n < k * f) {
    mode = 'reject';
    frames.push({
      pythonLine: P('if n < k * f:'), phase: 'check', activeLine: L('IF n < k × f THEN RETURN false'),
      counts: Object.fromEntries(counts), f, lanes: null, dealt: -1, lane: null, verdict: false, n, k,
      message: `${n} < ${k} × ${f} = ${k * f}, so there are too few values for ${f} sequences of length ${k}.`,
    });
    frames.push({
      pythonLine: P('return False'), phase: 'done', activeLine: L('IF n < k × f THEN RETURN false'),
      counts: Object.fromEntries(counts), f, lanes: null, dealt: -1, lane: null, verdict: false, n, k,
      message: 'Answer: false.',
    });
    return { input: { nums, k }, answer: false, mode, frames };
  }
  frames.push({
    pythonLine: P('if n < k * f:'), phase: 'check', activeLine: L('IF n < k × f THEN RETURN false'),
    counts: Object.fromEntries(counts), f, lanes: null, dealt: -1, lane: null, verdict: null, n, k,
    message: `${n} ≥ ${k} × ${f} = ${k * f}, so ${f} sequences can each reach length ${k}.`,
  });
  const lanes = Array.from({ length: f }, () => []);
  frames.push({
    pythonLine: P('lanes = [[] for'), phase: 'deal', activeLine: L('lanes ← f empty sequences'),
    counts: null, f, lanes: lanes.map((lane) => [...lane]), dealt: -1, lane: null, verdict: null, n, k,
    message: `Open ${f} empty sequence${f === 1 ? '' : 's'}.`,
  });
  nums.forEach((value, i) => {
    const lane = i % f;
    lanes[lane].push(value);
    frames.push({
      pythonLine: P('lanes[i % f].append'), phase: 'deal', activeLine: L('append nums[i] to lanes[i mod f]'),
      counts: null, f, lanes: lanes.map((entry) => [...entry]), dealt: i, lane, verdict: null, n, k,
      message: `Index ${i} (value ${value}) goes to sequence ${lane + 1}.`,
    });
  });
  let ok = true;
  for (let lane = 0; lane < f && ok; lane += 1) {
    const items = lanes[lane];
    const strict = items.every((value, j) => j === 0 || items[j - 1] < value);
    const longEnough = items.length >= k;
    frames.push({
      pythonLine: P('for lane in lanes:'), phase: 'verify', activeLine: L('FOR each lane'),
      counts: null, f, lanes: lanes.map((entry) => [...entry]), dealt: -1, lane, verdict: strict && longEnough, n, k,
      message: `Sequence ${lane + 1} has ${items.length} value${items.length === 1 ? '' : 's'}: ${strict ? 'strictly increasing' : 'not strictly increasing'}, ${longEnough ? `length at least ${k}` : `shorter than ${k}`}.`,
    });
    if (!strict || !longEnough) ok = false;
  }
  frames.push({
    pythonLine: P(ok ? 'return True' : 'return False'), phase: 'done', activeLine: ok ? L('RETURN true') : L('IF lane is not strictly increasing'),
    counts: null, f, lanes: lanes.map((entry) => [...entry]), dealt: -1, lane: null, verdict: ok, n, k,
    message: `Answer: ${ok}.`,
  });
  return { input: { nums, k }, answer: ok, mode: ok ? 'deal' : 'fail', frames };
}
