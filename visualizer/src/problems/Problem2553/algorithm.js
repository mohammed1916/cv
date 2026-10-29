export const code = [
  { line: 1, text: "answer = empty list" },
  { line: 2, text: "for each value in nums in order" },
  { line: 3, text: "for each digit of value from left to right" },
  { line: 4, text: "append digit to answer" },
  { line: 5, text: "return answer" },
];

export const python = `def separateDigits(nums):
    answer = []
    for value in nums:
        for digit in str(value):
            answer.append(int(digit))
    return answer`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [13, 25, 83, 77]}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.nums)) {
    throw new Error("Input must be a JSON object with an array key nums");
  }
  if (data.nums.length < 1) throw new Error("nums must contain at least one value");
  if (data.nums.length > 20) throw new Error(`nums length ${data.nums.length} exceeds the visualization cap of 20`);
  for (const value of data.nums) {
    if (!Number.isInteger(value) || value < 1 || value > 100000) {
      throw new Error("Every nums value must be a positive integer up to 100000");
    }
  }
  return { nums: [...data.nums] };
}

export function buildTrace(input) {
  const { nums } = input;
  const frames = [];
  const answer = [];
  let valueIndex = -1;
  let digitIndex = -1;
  let current = null;
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({
      phase, activeLine, pythonLine, message, nums: [...nums], valueIndex, digitIndex,
      current, answer: [...answer],
    });

  frame("setup", 1, 2, "The answer starts as an empty list.");
  for (let i = 0; i < nums.length; i++) {
    valueIndex = i;
    current = nums[i];
    frame("scan", 2, 3, `Take the value ${current} from nums.`);
    const digits = String(current);
    for (let d = 0; d < digits.length; d++) {
      digitIndex = d;
      frame("digit", 3, 4, `Next digit of ${current} is ${digits[d]}.`);
      answer.push(Number(digits[d]));
      frame("append", 4, 5, `Append ${digits[d]}; answer now has ${answer.length} digits.`);
    }
    digitIndex = -1;
  }
  frame("done", 5, 6, `Separated ${answer.length} digits in total.`);
  return { input, result: answer, frames };
}
