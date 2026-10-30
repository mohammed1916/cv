export const code = [
  { line: 1, text: "set the even-index sum and the odd-index sum to 0" },
  { line: 2, text: "for each digit with its index i" },
  { line: 3, text: "if i is even, add the digit to the even-index sum" },
  { line: 4, text: "otherwise add the digit to the odd-index sum" },
  { line: 5, text: "return whether the two sums are equal" },
];

export const python = `def isBalanced(num):
    even = 0
    odd = 0
    for i, ch in enumerate(num):
        if i % 2 == 0:
            even += int(ch)
        else:
            odd += int(ch)
    return even == odd`;

const PYTHON_LINES = python.split("\n");
const pyLine = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"num": "1234"}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with a "num" key');
  const { num } = data;
  if (typeof num !== "string") throw new Error('"num" must be a string of digits');
  if (num.length < 2 || num.length > 100) throw new Error(`"num" length must be between 2 and 100 (got ${num.length})`);
  if (!/^[0-9]+$/.test(num)) throw new Error('"num" must contain only the digits 0 to 9');
  return { num };
}

export function buildTrace(input) {
  const { num } = input;
  const frames = [];
  let even = 0;
  let odd = 0;
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: pyLine("even = 0"),
    message: "Start both sums at 0.", index: -1, even, odd,
  });
  for (let i = 0; i < num.length; i += 1) {
    const digit = Number(num[i]);
    frames.push({
      phase: "scan", activeLine: 2, pythonLine: pyLine("for i, ch"),
      message: `Read digit ${digit} at index ${i}.`, index: i, even, odd,
    });
    if (i % 2 === 0) {
      even += digit;
      frames.push({
        phase: "add", activeLine: 3, pythonLine: pyLine("even += int"),
        message: `Index ${i} is even, so even becomes ${even}.`, index: i, even, odd,
      });
    } else {
      odd += digit;
      frames.push({
        phase: "add", activeLine: 4, pythonLine: pyLine("odd += int"),
        message: `Index ${i} is odd, so odd becomes ${odd}.`, index: i, even, odd,
      });
    }
  }
  const result = even === odd;
  frames.push({
    phase: "done", activeLine: 5, pythonLine: pyLine("return even == odd"),
    message: `${even} ${result ? "equals" : "does not equal"} ${odd}, so the answer is ${result}.`,
    index: -1, even, odd, result,
  });
  return { input, result, frames };
}
