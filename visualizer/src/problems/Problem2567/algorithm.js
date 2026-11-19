// Two solutions for 2567. Both reduce to: change the two values that leave the smallest
// possible span among the remaining values, so the answer is min of three candidate spans.

const SORT_CODE = [
  'function minimizeSum(nums) {',
  '  const values = [...nums].sort((a, b) => a - b)',
  '  const n = values.length',
  '  const one = values[n - 1] - values[2]',
  '  const two = values[n - 2] - values[1]',
  '  const three = values[n - 3] - values[0]',
  '  return Math.min(one, two, three)',
  '}',
];

const SORT_PYTHON_LINES = [
  'class Solution:',
  '    def minimizeSum(self, nums: List[int]) -> int:',
  '        values = sorted(nums)',
  '        one = values[-1] - values[2]',
  '        two = values[-2] - values[1]',
  '        three = values[-3] - values[0]',
  '        return min(one, two, three)',
];

const TRACKER_CODE = [
  'function minimizeSum(nums) {',
  '  let smallest1 = Infinity, smallest2 = Infinity, smallest3 = Infinity',
  '  let largest1 = -Infinity, largest2 = -Infinity, largest3 = -Infinity',
  '  for (const num of nums) {',
  '    if (num < smallest3) {',
  '      if (num < smallest2) {',
  '        smallest3 = smallest2',
  '        if (num < smallest1) { smallest2 = smallest1; smallest1 = num }',
  '        else smallest2 = num',
  '      } else smallest3 = num',
  '    }',
  '    if (num > largest1) {',
  '      if (num > largest2) {',
  '        largest1 = largest2',
  '        if (num > largest3) { largest2 = largest3; largest3 = num }',
  '        else largest2 = num',
  '      } else largest1 = num',
  '    }',
  '  }',
  '  const one = largest3 - smallest3',
  '  const two = largest2 - smallest2',
  '  const three = largest1 - smallest1',
  '  return Math.min(one, two, three)',
  '}',
];

const TRACKER_PYTHON_LINES = [
  'class Solution:',
  '    def minimizeSum(self, nums: List[int]) -> int:',
  "        smallest1 = smallest2 = smallest3 = float('inf')",
  "        largest1 = largest2 = largest3 = float('-inf')",
  '        for num in nums:',
  '            if num < smallest3:',
  '                if num < smallest2:',
  '                    smallest3 = smallest2',
  '                    if num < smallest1:',
  '                        smallest2 = smallest1',
  '                        smallest1 = num',
  '                    else:',
  '                        smallest2 = num',
  '                else:',
  '                    smallest3 = num',
  '            if num > largest1:',
  '                if num > largest2:',
  '                    largest1 = largest2',
  '                    if num > largest3:',
  '                        largest2 = largest3',
  '                        largest3 = num',
  '                    else:',
  '                        largest2 = num',
  '                else:',
  '                    largest1 = num',
  '        one = largest3 - smallest3',
  '        two = largest2 - smallest2',
  '        three = largest1 - smallest1',
  '        return min(one, two, three)',
];

const toCode = lines => lines.map((text, index) => ({ line: index + 1, text }));
const find = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment));
  if (index < 0) throw new Error(`missing line: ${fragment}`);
  return index + 1;
};

const jsLine = fragment => find(TRACKER_CODE, fragment);

export const code = toCode(SORT_CODE);
export const python = SORT_PYTHON_LINES.join('\n');
export const trackerCode = toCode(TRACKER_CODE);
export const trackerPython = TRACKER_PYTHON_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the original values.' },
  { id: 'sort', label: 'Sort', description: 'Sort the values so the three candidate spans are visible.' },
  { id: 'candidate', label: 'Candidates', description: 'Measure the span left after changing two values.' },
  { id: 'pick', label: 'Pick', description: 'Choose the smallest span.' },
  { id: 'done', label: 'Result', description: 'Report the minimum score.' },
];

export const trackerPhases = [
  { id: 'setup', label: 'Setup', description: 'Start with three empty slots on each side.' },
  { id: 'scan', label: 'Read', description: 'Read the next value.' },
  { id: 'smallest', label: 'Three smallest', description: 'The value enters the three smallest values.' },
  { id: 'largest', label: 'Three largest', description: 'The value enters the three largest values.' },
  { id: 'candidate', label: 'Candidates', description: 'Measure the span left after changing two values.' },
  { id: 'pick', label: 'Pick', description: 'Choose the smallest span.' },
  { id: 'done', label: 'Result', description: 'Report the minimum score.' },
];

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [1, 4, 7, 8, 5]}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.nums)) {
    throw new Error('Input must be a JSON object with an array key nums');
  }
  if (data.nums.length < 3) throw new Error('nums must contain at least three values');
  if (data.nums.length > 40) throw new Error(`nums length ${data.nums.length} exceeds the visualization cap of 40`);
  for (const value of data.nums) {
    if (!Number.isInteger(value) || Math.abs(value) > 1e9) {
      throw new Error('Every nums value must be an integer with absolute value up to 1000000000');
    }
  }
  return { nums: [...data.nums] };
}

// Candidate spans: the kept values after changing two of the sorted values.
function candidates(values) {
  const n = values.length;
  return [
    { name: 'one', activeLine: 4, pythonLine: find(SORT_PYTHON_LINES, 'one = values'), low: values[2], high: values[n - 1], value: values[n - 1] - values[2], pair: [2, n - 1], text: `change the two smallest; keep ${values[2]} to ${values[n - 1]}` },
    { name: 'two', activeLine: 5, pythonLine: find(SORT_PYTHON_LINES, 'two = values'), low: values[1], high: values[n - 2], value: values[n - 2] - values[1], pair: [1, n - 2], text: `change the smallest and largest; keep ${values[1]} to ${values[n - 2]}` },
    { name: 'three', activeLine: 6, pythonLine: find(SORT_PYTHON_LINES, 'three = values'), low: values[0], high: values[n - 3], value: values[n - 3] - values[0], pair: [0, n - 3], text: `change the two largest; keep ${values[0]} to ${values[n - 3]}` },
  ];
}

export function buildTrace(input) {
  const { nums } = input;
  const frames = [];
  let values = [];
  let candidate = null;
  let best = null;
  let span = null;
  let spanOptions = [];
  const domain = () => [values[0], values[values.length - 1]];
  const frame = (phase, activeLine, pythonLine, message, pair = []) =>
    frames.push({ phase, activeLine, pythonLine, message, values: [...values], candidate, best, pair, span, spanOptions, domain: values.length ? domain() : null });

  frame('setup', 2, find(SORT_PYTHON_LINES, 'values = sorted'), 'Original values are read, not yet sorted.');
  values = [...nums].sort((a, b) => a - b);
  frame('sort', 2, find(SORT_PYTHON_LINES, 'values = sorted'), `Sorted values: [${values.join(', ')}].`);
  best = Infinity;
  const options = candidates(values);
  options.forEach((option, k) => {
    candidate = option.name;
    best = Math.min(best, option.value);
    span = [option.low, option.high];
    spanOptions = options.slice(0, k + 1).map(o => ({ name: o.name, low: o.low, high: o.high, value: o.value }));
    frame('candidate', option.activeLine, option.pythonLine, `${option.text}: span ${option.value}.`, option.pair);
  });
  spanOptions = options.map(o => ({ name: o.name, low: o.low, high: o.high, value: o.value }));
  span = null;
  candidate = null;
  frame('pick', 7, find(SORT_PYTHON_LINES, 'return min'), `The smallest span is ${best}.`);
  frame('done', 7, find(SORT_PYTHON_LINES, 'return min'), `Minimum score: ${best}.`);
  return { input, result: best, frames, approach: 'sort' };
}

export function buildTrackerTrace(input) {
  const { nums } = input;
  const frames = [];
  const s = [Infinity, Infinity, Infinity];
  const l = [-Infinity, -Infinity, -Infinity];
  const show = value => (value === Infinity ? '∞' : value === -Infinity ? '−∞' : String(value));
  let index = -1;
  let current = null;
  let changedSmall = [];
  let changedLarge = [];
  let candidate = null;
  let span = null;
  let spanOptions = [];
  let best = null;
  const sortedDomain = [Math.min(...nums), Math.max(...nums)];
  const frame = (phase, activeLine, pythonLine, message) => frames.push({
    phase,
    activeLine,
    pythonLine,
    message,
    index,
    current,
    smallest: [...s],
    largest: [...l],
    changedSmall: [...changedSmall],
    changedLarge: [...changedLarge],
    candidate,
    span,
    spanOptions,
    domain: sortedDomain,
    best,
    pair: [],
    values: [],
  });

  frame('setup', jsLine('let smallest1'), find(TRACKER_PYTHON_LINES, "smallest1 = smallest2"), 'Three smallest slots start at ∞ and three largest slots start at −∞.');
  for (let i = 0; i < nums.length; i += 1) {
    index = i;
    current = nums[i];
    changedSmall = [];
    changedLarge = [];
    frame('scan', jsLine('for (const num'), find(TRACKER_PYTHON_LINES, 'for num in nums'), `Read ${nums[i]} at index ${i}.`);

    const beforeSmall = [...s];
    if (nums[i] < s[2]) {
      if (nums[i] < s[1]) {
        s[2] = s[1];
        if (nums[i] < s[0]) { s[1] = s[0]; s[0] = nums[i]; } else { s[1] = nums[i]; }
      } else {
        s[2] = nums[i];
      }
      changedSmall = s.map((value, slot) => value !== beforeSmall[slot]);
      frame('smallest', jsLine('if (num < smallest3)'), find(TRACKER_PYTHON_LINES, 'if num < smallest3'), `${nums[i]} enters the three smallest: [${s.map(show).join(', ')}].`);
    }

    const beforeLarge = [...l];
    if (nums[i] > l[0]) {
      if (nums[i] > l[1]) {
        l[0] = l[1];
        if (nums[i] > l[2]) { l[1] = l[2]; l[2] = nums[i]; } else { l[1] = nums[i]; }
      } else {
        l[0] = nums[i];
      }
      changedLarge = l.map((value, slot) => value !== beforeLarge[slot]);
      frame('largest', jsLine('if (num > largest1)'), find(TRACKER_PYTHON_LINES, 'if num > largest1'), `${nums[i]} enters the three largest: [${l.map(show).join(', ')}].`);
    }
  }

  // Reset per-element highlights once the scan ends.
  index = -1;
  current = null;
  changedSmall = [];
  changedLarge = [];
  const options = [
    { name: 'one', activeLine: jsLine('const one'), pythonLine: find(TRACKER_PYTHON_LINES, 'one = largest3'), low: s[2], high: l[2], value: l[2] - s[2], text: `change the two smallest; keep ${s[2]} to ${l[2]}` },
    { name: 'two', activeLine: jsLine('const two'), pythonLine: find(TRACKER_PYTHON_LINES, 'two = largest2'), low: s[1], high: l[1], value: l[1] - s[1], text: `change the smallest and largest; keep ${s[1]} to ${l[1]}` },
    { name: 'three', activeLine: jsLine('const three'), pythonLine: find(TRACKER_PYTHON_LINES, 'three = largest1'), low: s[0], high: l[0], value: l[0] - s[0], text: `change the two largest; keep ${s[0]} to ${l[0]}` },
  ];
  best = Infinity;
  const spanList = options.map(o => ({ name: o.name, low: o.low, high: o.high, value: o.value }));
  options.forEach((option, k) => {
    candidate = option.name;
    best = Math.min(best, option.value);
    span = [option.low, option.high];
    spanOptions = spanList.slice(0, k + 1);
    frame('candidate', option.activeLine, option.pythonLine, `${option.text}: span ${option.value}.`);
  });
  spanOptions = spanList;
  span = null;
  candidate = null;
  frame('pick', jsLine('return Math.min'), find(TRACKER_PYTHON_LINES, 'return min'), `The smallest span is ${best}.`);
  frame('done', jsLine('return Math.min'), find(TRACKER_PYTHON_LINES, 'return min'), `Minimum score: ${best}.`);
  return { input, result: best, frames, approach: 'tracker' };
}
