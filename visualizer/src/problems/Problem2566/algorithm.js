export const code = [
  { line: 1, text: "text = the digits of num" },
  { line: 2, text: "high = text" },
  { line: 3, text: "for each digit from left to right" },
  { line: 4, text: "if digit is not 9" },
  { line: 5, text: "high = text with every occurrence of that digit replaced by 9, then stop" },
  { line: 6, text: "low = text with every occurrence of the first digit replaced by 0" },
  { line: 7, text: "return integer value of high minus integer value of low" },
];

export const python = `def maxDiff(num):
    text = str(num)
    high = text
    for digit in text:
        if digit != '9':
            high = text.replace(digit, '9')
            break
    low = text.replace(text[0], '0')
    return int(high) - int(low)`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"num": 11891}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with an integer key num");
  }
  const { num } = data;
  if (!Number.isInteger(num) || num < 1) throw new Error("num must be a positive integer");
  if (String(num).length > 8) throw new Error("num has more than 8 digits; the visualization caps it at 8");
  return { num };
}

export function buildTrace(input) {
  const { num } = input;
  const text = String(num);
  const frames = [];
  let high = text;
  let low = null;
  let foundIndex = -1;
  let scanIndex = -1;
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({ phase, activeLine, pythonLine, message, num, text, high, low, scanIndex, foundIndex });

  frame("setup", 1, 2, `The digits of ${num} are ${text}.`);
  frame("setup", 2, 3, "Start with high equal to the original digits.");
  for (let i = 0; i < text.length; i++) {
    scanIndex = i;
    frame("scan", 3, 4, `Look at digit ${text[i]} at position ${i}.`);
    if (text[i] !== "9") {
      foundIndex = i;
      frame("scan", 4, 5, `Digit ${text[i]} is not 9, so it is the one to remap upward.`);
      high = text.split(text[i]).join("9");
      frame("raise", 5, 6, `Replacing every ${text[i]} with 9 gives high = ${high}.`);
      frame("raise", 5, 7, "Stop scanning after the first remap.");
      break;
    }
    frame("scan", 4, 5, "Digit is 9, so keep scanning.");
  }
  scanIndex = -1;
  low = text.split(text[0]).join("0");
  frame("lower", 6, 8, `Replacing every ${text[0]} with 0 gives low = ${low}.`);
  const result = Number(high) - Number(low);
  frame("done", 7, 9, `${high} minus ${low} gives ${result}.`);
  return { input, result, frames };
}
