const CODE = [
  'function findTheArrayConcVal(nums) {',
  '  let total = 0, left = 0, right = nums.length - 1',
  '  while (left < right) {',
  '    total += Number(`${nums[left]}${nums[right]}`)',
  '    left++; right--',
  '  }',
  '  if (left === right) total += nums[left]',
  '  return total',
  '}',
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const python = `def findTheArrayConcVal(nums):
    total = 0
    left = 0
    right = len(nums) - 1
    while left < right:
        total += int(str(nums[left]) + str(nums[right]))
        left += 1
        right -= 1
    if left == right:
        total += nums[left]
    return total`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [7, 52, 2, 4]}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.nums)) {
    throw new Error("Input must be a JSON object with an array key nums");
  }
  if (data.nums.length < 1) throw new Error("nums must contain at least one value");
  if (data.nums.length > 40) throw new Error(`nums length ${data.nums.length} exceeds the visualization cap of 40`);
  for (const value of data.nums) {
    if (!Number.isInteger(value) || value < 1 || value > 10000) {
      throw new Error("Every nums value must be a positive integer up to 10000");
    }
  }
  return { nums: [...data.nums] };
}

export function buildTrace(input) {
  const { nums } = input;
  const frames = [];
  let total = 0;
  let left = 0;
  let right = nums.length - 1;
  let joined = null;
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({ phase, activeLine, pythonLine, message, nums: [...nums], left, right, total, joined });

  frame("setup", 2, 2, "The running total starts at 0.");
  frame("setup", 2, 3, "The left pointer starts at the first value.");
  frame("setup", 2, 4, `The right pointer starts at index ${right}.`);
  while (true) {
    frame("loop", 3, 5, left < right ? `Compare left ${left} with right ${right}.` : `Pointers have met or crossed (left ${left}, right ${right}); the loop stops.`);
    if (!(left < right)) break;
    joined = `${nums[left]}${nums[right]}`;
    total += Number(joined);
    frame("concat", 4, 6, `Join ${nums[left]} and ${nums[right]} into ${joined}; total is now ${total}.`);
    left += 1;
    frame("move", 5, 7, `Move left to ${left}.`);
    right -= 1;
    frame("move", 5, 8, `Move right to ${right}.`);
  }
  joined = null;
  frame("middle", 7, 9, left === right ? `left equals right at index ${left}, so there is a middle value.` : "No middle value remains.");
  if (left === right) {
    total += nums[left];
    frame("middle", 7, 10, `Add the middle value ${nums[left]}; total is ${total}.`);
  }
  frame("done", 8, 11, `The array concatenation value is ${total}.`);
  return { input, result: total, frames };
}
