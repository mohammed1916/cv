export const code = [
  { line: 1, text: "sum of encrypted integers (nums):" },
  { line: 2, text: "  set total to 0" },
  { line: 3, text: "  for each number x in nums" },
  { line: 4, text: "    write x as its digits" },
  { line: 5, text: "    find the largest digit" },
  { line: 6, text: "    add the largest digit repeated once per digit to total" },
  { line: 7, text: "  return total" },
];

export const python = `def sumOfEncryptedInt(nums):
    total = 0
    for x in nums:
        digits = str(x)
        largest = max(digits)
        total += int(largest * len(digits))
    return total`;

export function encrypt(x) {
  const digits = String(x);
  const largest = digits.split("").reduce((a, b) => (b > a ? b : a));
  return Number(largest.repeat(digits.length));
}

export function parseInput(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("Input must be a JSON object with nums");
  }
  if (!obj || typeof obj !== "object" || !Array.isArray(obj.nums)) {
    throw new Error("nums must be an array of positive integers");
  }
  if (obj.nums.length < 1 || obj.nums.length > 50) {
    throw new Error(`nums length (${obj.nums.length}) must be between 1 and 50 for this visualization`);
  }
  if (obj.nums.some((x) => !Number.isInteger(x) || x < 1 || x > 1000)) {
    throw new Error("every value in nums must be an integer from 1 to 1000");
  }
  return { nums: obj.nums };
}

export function buildTrace(input) {
  const { nums } = input;
  const frames = [];
  const encrypted = [];
  let total = 0;
  frames.push({ phase: "start", activeLine: 2, pythonLine: 2, message: "Start with total = 0.", index: -1, encrypted: [], total });
  for (let i = 0; i < nums.length; i++) {
    frames.push({ phase: "scan", activeLine: 3, pythonLine: 3, message: `Take nums[${i}] = ${nums[i]}.`, index: i, encrypted: [...encrypted], total });
    const value = encrypt(nums[i]);
    frames.push({ phase: "encrypt", activeLine: 5, pythonLine: 5, message: `Every digit of ${nums[i]} becomes its largest digit, giving ${value}.`, index: i, encrypted: [...encrypted], total });
    total += value;
    encrypted.push(value);
    frames.push({ phase: "add", activeLine: 6, pythonLine: 6, message: `Add ${value} to the total, now ${total}.`, index: i, encrypted: [...encrypted], total });
  }
  frames.push({ phase: "done", activeLine: 7, pythonLine: 7, message: `Return ${total}.`, index: -1, encrypted: [...encrypted], total });
  return { input, result: total, frames };
}
