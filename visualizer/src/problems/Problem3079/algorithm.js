export const code = `function sumOfEncryptedInt(nums) {
  let total = 0
  for (const x of nums) {
    const digits = String(x)
    const largest = digits.split('').reduce((a, b) => (b > a ? b : a))
    total += Number(largest.repeat(digits.length))
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }));
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('No code line: ' + s); return i + 1 };
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
  frames.push({ phase: "start", activeLine: L('let total = 0'), pythonLine: 2, message: "Start with total = 0.", index: -1, encrypted: [], total });
  for (let i = 0; i < nums.length; i++) {
    frames.push({ phase: "scan", activeLine: L('for (const x of nums)'), pythonLine: 3, message: `Take nums[${i}] = ${nums[i]}.`, index: i, encrypted: [...encrypted], total });
    const value = encrypt(nums[i]);
    frames.push({ phase: "encrypt", activeLine: L('const largest'), pythonLine: 5, message: `Every digit of ${nums[i]} becomes its largest digit, giving ${value}.`, index: i, encrypted: [...encrypted], total });
    total += value;
    encrypted.push(value);
    frames.push({ phase: "add", activeLine: L('total +='), pythonLine: 6, message: `Add ${value} to the total, now ${total}.`, index: i, encrypted: [...encrypted], total });
  }
  frames.push({ phase: "done", activeLine: L('return total'), pythonLine: 7, message: `Return ${total}.`, index: -1, encrypted: [...encrypted], total });
  return { input, result: total, frames };
}
