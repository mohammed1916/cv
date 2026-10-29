export const code = [
  { line: 1, text: "values = sorted copy of nums" },
  { line: 2, text: "best = smallest of the three candidates below" },
  { line: 3, text: "candidate one: last value minus value at index 2" },
  { line: 4, text: "candidate two: second last value minus value at index 1" },
  { line: 5, text: "candidate three: third last value minus value at index 0" },
  { line: 6, text: "return best" },
];

export const python = `def minimumScore(nums):
    values = sorted(nums)
    best = min(values[-1] - values[2], values[-2] - values[1], values[-3] - values[0])
    return best`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [1, 4, 7, 8, 5]}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.nums)) {
    throw new Error("Input must be a JSON object with an array key nums");
  }
  if (data.nums.length < 3) throw new Error("nums must contain at least three values");
  if (data.nums.length > 40) throw new Error(`nums length ${data.nums.length} exceeds the visualization cap of 40`);
  for (const value of data.nums) {
    if (!Number.isInteger(value) || Math.abs(value) > 1e9) throw new Error("Every nums value must be an integer with absolute value up to 1000000000");
  }
  return { nums: [...data.nums] };
}

export function buildTrace(input) {
  const { nums } = input;
  const frames = [];
  let values = [];
  let candidate = null;
  let best = null;
  const frame = (phase, activeLine, pythonLine, message, pair = []) =>
    frames.push({ phase, activeLine, pythonLine, message, values: [...values], candidate, best, pair });
  const n = nums.length;

  frame("setup", 1, 2, "Original values are read, not yet sorted.");
  values = [...nums].sort((a, b) => a - b);
  frame("sort", 1, 2, `Sorted values: [${values.join(", ")}].`);
  const options = [
    { name: "one", activeLine: 3, value: values[n - 1] - values[2], pair: [2, n - 1], text: `candidate one: ${values[n - 1]} minus ${values[2]}` },
    { name: "two", activeLine: 4, value: values[n - 2] - values[1], pair: [1, n - 2], text: `candidate two: ${values[n - 2]} minus ${values[1]}` },
    { name: "three", activeLine: 5, value: values[n - 3] - values[0], pair: [0, n - 3], text: `candidate three: ${values[n - 3]} minus ${values[0]}` },
  ];
  best = Infinity;
  for (const option of options) {
    candidate = option.name;
    best = Math.min(best, option.value);
    frame("candidate", option.activeLine, 3, `${option.text} = ${option.value}.`, option.pair);
  }
  frame("pick", 2, 3, `The smallest candidate is ${best}.`);
  candidate = null;
  frame("done", 6, 4, `Minimum score: ${best}.`);
  return { input, result: best, frames };
}
