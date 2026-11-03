export const phases = [
  { id: 'start', label: 'Empty target', description: 'Begin with an empty target list.' },
  { id: 'insert', label: 'Insert value', description: 'Place nums[i] at the position named by index[i], shifting later values right.' },
  { id: 'done', label: 'Return target', description: 'Every value has been inserted in order.' },
];

export const examples = [
  { label: 'Mixed positions', input: JSON.stringify({ nums: [4, 9, 2, 7], index: [0, 0, 1, 2] }) },
  { label: 'Append only', input: JSON.stringify({ nums: [1, 2, 3], index: [0, 1, 2] }) },
];

export function parseInput(text) {
  const data = JSON.parse(text);
  const nums = data?.nums, index = data?.index;
  if (!Array.isArray(nums) || !Array.isArray(index) || nums.length < 1 || nums.length > 100 || nums.length !== index.length) {
    throw new Error('Enter {"nums":[...],"index":[...]} with 1 to 100 entries in each list.');
  }
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1e9)) {
    throw new Error('Values must be integers between -1,000,000,000 and 1,000,000,000.');
  }
  index.forEach((pos, i) => {
    if (!Number.isInteger(pos) || pos < 0 || pos > i) {
      throw new Error(`index[${i}] must be an integer from 0 to ${i}, the target size when it is inserted.`);
    }
  });
  return { nums, index };
}

export function buildTrace({ nums, index }) {
  const target = [];
  const frames = [{
    phase: 'start', activeLine: 2, message: 'Start with an empty target list.',
    snapshot: { target: [], i: -1, value: undefined, position: -1 },
  }];
  nums.forEach((value, i) => {
    target.splice(index[i], 0, value);
    frames.push({
      phase: 'insert', activeLine: 4,
      message: `Insert ${value} at position ${index[i]}; the list now has ${target.length} item(s).`,
      snapshot: { target: [...target], i, value, position: index[i] },
    });
  });
  frames.push({
    phase: 'done', activeLine: 5, message: `Return [${target.join(', ')}].`,
    snapshot: { target: [...target], i: -1, value: undefined, position: -1 },
  });
  return { input: { nums, index }, result: [...target], frames };
}

export const code = [
  'FUNCTION createTargetArray(nums, index)',
  '    target ← empty list',
  '    FOR i FROM 0 TO length(nums) − 1',
  '        INSERT nums[i] INTO target AT position index[i]',
  '    RETURN target',
].map((text, i) => ({ line: i + 1, text }));

export const python = `def createTargetArray(nums, index):
    target = []
    for value, position in zip(nums, index):
        target.insert(position, value)
    return target`;

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
