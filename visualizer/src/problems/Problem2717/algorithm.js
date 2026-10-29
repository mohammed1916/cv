export const PYTHON_LINES = [
  "def semiOrderedPermutation(nums):",
  "    n = len(nums)",
  "    one = nums.index(1)",
  "    last = nums.index(n)",
  "    swaps = one",
  "    swaps += n - 1 - last",
  "    if one > last:",
  "        swaps -= 1",
  "    return swaps",
];

export const CODE = [
  "Let n be the length of nums",
  "Let one be the index of the value 1",
  "Let last be the index of the value n",
  "Set swaps to one, the cost of moving 1 to the front",
  "Add n - 1 - last, the cost of moving n to the end",
  "If one is after last",
  "Subtract 1 because one swap serves both moves",
  "Return swaps",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export function parseInput(input) {
  let obj = input;
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input);
    } catch {
      throw new Error('Input must be a JSON object such as {"nums": [2,1,4,3]}.');
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object with a "nums" array.');
  }
  const nums = obj.nums;
  if (!Array.isArray(nums)) {
    throw new Error('"nums" must be an array of integers.');
  }
  const n = nums.length;
  if (n < 2 || n > 50) {
    throw new Error(`nums length must be between 2 and 50; got ${n}.`);
  }
  if (!nums.every(Number.isInteger)) {
    throw new Error('Every value in "nums" must be an integer.');
  }
  const sorted = [...nums].sort((a, b) => a - b);
  if (sorted.some((value, index) => value !== index + 1)) {
    throw new Error(`"nums" must be a permutation of 1 to ${n}.`);
  }
  return { nums: [...nums] };
}

export function buildTrace(input) {
  const { nums } = parseInput(input);
  const n = nums.length;
  const frames = [];
  const push = (frame) => frames.push({ nums, n, one: -1, last: -1, swaps: 0, ...frame });

  push({ phase: "setup", activeLine: 1, pythonLine: 2, message: `n = ${n}, the length of the permutation.` });

  const one = nums.indexOf(1);
  push({ phase: "find", activeLine: 2, pythonLine: 3, message: `The value 1 sits at index ${one}.`, one });

  const last = nums.indexOf(n);
  push({ phase: "find", activeLine: 3, pythonLine: 4, message: `The value ${n} sits at index ${last}.`, one, last });

  let swaps = one;
  push({ phase: "front", activeLine: 4, pythonLine: 5, message: `Moving 1 to the front takes ${one} adjacent swap(s). Running total: ${swaps}.`, one, last, swaps });

  const toEnd = n - 1 - last;
  swaps += toEnd;
  push({ phase: "back", activeLine: 5, pythonLine: 6, message: `Moving ${n} to the end takes ${toEnd} adjacent swap(s). Running total: ${swaps}.`, one, last, swaps });

  if (one > last) {
    push({ phase: "check", activeLine: 6, pythonLine: 7, message: `1 is after ${n}, so the two moves share one swap.`, one, last, swaps });
    swaps -= 1;
    push({ phase: "adjust", activeLine: 7, pythonLine: 8, message: `Subtract the shared swap. Total: ${swaps}.`, one, last, swaps });
  } else {
    push({ phase: "check", activeLine: 6, pythonLine: 7, message: `1 is before ${n}, so the two moves do not overlap. No correction needed.`, one, last, swaps });
  }

  push({ phase: "done", activeLine: 8, pythonLine: 9, message: `Return ${swaps}.`, one, last, swaps, result: swaps });
  return { input: { nums }, result: swaps, frames };
}
