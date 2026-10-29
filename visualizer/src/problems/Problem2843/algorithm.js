const PYTHON_LINES = [
  "def countSymmetricIntegers(low, high):",
  "    count = 0",
  "    for x in range(low, high + 1):",
  "        digits = str(x)",
  "        if len(digits) % 2 == 1:",
  "            continue",
  "        half = len(digits) // 2",
  "        left_sum = sum(int(d) for d in digits[:half])",
  "        right_sum = sum(int(d) for d in digits[half:])",
  "        if left_sum == right_sum:",
  "            count += 1",
  "    return count",
];

const CODE_LINES = [
  "count <- 0",
  "for x from low to high",
  "  digits <- decimal digits of x",
  "  if the number of digits is odd",
  "    skip x",
  "  half <- number of digits divided by 2",
  "  left sum <- sum of the first half digits",
  "  right sum <- sum of the second half digits",
  "  if left sum equals right sum",
  "    count <- count + 1",
  "return count",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

const MAX_RANGE = 120;

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with low and high.");
  const { low, high } = input;
  if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error("low and high must be integers.");
  if (low < 1 || high > 10000 || low > high) throw new Error("Require 1 <= low <= high <= 10000.");
  if (high - low + 1 > MAX_RANGE) throw new Error(`This visualization traces at most ${MAX_RANGE} numbers (got ${high - low + 1}).`);
  return { low, high };
}

export function buildTrace(input) {
  const { low, high } = parseInput(input);
  const numbers = [];
  for (let x = low; x <= high; x += 1) numbers.push(x);
  const frames = [];
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: numbers, active: -1, roles: Array(numbers.length).fill(""), detail: "", ...extra,
  });
  const withRole = (index, role) => { const r = Array(numbers.length).fill(""); r[index] = role; return r; };

  push("setup", 1, py("count = 0"), `Count symmetric integers in [${low}, ${high}].`, { detail: "count = 0" });
  let count = 0;
  numbers.forEach((x, index) => {
    push("scan", 2, py("for x in range(low, high + 1):"), `Next number: ${x}.`, { active: index, roles: withRole(index, "current") });
    const digits = String(x);
    push("scan", 3, py("digits = str(x)"), `Digits of ${x}: "${digits}".`, { active: index, roles: withRole(index, "current"), detail: `digits = "${digits}"` });
    if (digits.length % 2 === 1) {
      push("scan", 4, py("if len(digits) % 2 == 1:"), `${digits.length} digits is odd, so ${x} is not symmetric.`, { active: index, roles: withRole(index, "skip") });
      push("scan", 5, py("continue"), "Skip to the next number.", { active: index, roles: withRole(index, "skip") });
      return;
    }
    push("scan", 4, py("if len(digits) % 2 == 1:"), `${digits.length} digits is even; compare the two halves.`, { active: index, roles: withRole(index, "current") });
    const half = digits.length / 2;
    const leftSum = [...digits.slice(0, half)].reduce((a, d) => a + Number(d), 0);
    const rightSum = [...digits.slice(half)].reduce((a, d) => a + Number(d), 0);
    push("scan", 7, py("left_sum = sum(int(d) for d in digits[:half])"), `First half "${digits.slice(0, half)}" sums to ${leftSum}.`, { active: index, roles: withRole(index, "current"), detail: `left_sum = ${leftSum}` });
    push("scan", 8, py("right_sum = sum(int(d) for d in digits[half:])"), `Second half "${digits.slice(half)}" sums to ${rightSum}.`, { active: index, roles: withRole(index, "current"), detail: `right_sum = ${rightSum}` });
    if (leftSum === rightSum) {
      count += 1;
      push("count", 10, py("count += 1"), `${leftSum} = ${rightSum}, so ${x} is symmetric. Count is ${count}.`, { active: index, roles: withRole(index, "match"), detail: `count = ${count}` });
    } else {
      push("scan", 9, py("if left_sum == right_sum:"), `${leftSum} differs from ${rightSum}; not symmetric.`, { active: index, roles: withRole(index, "skip") });
    }
  });
  push("result", 11, py("return count"), `${count} symmetric integers in range.`, { detail: `return ${count}` });
  return { input: { low, high }, result: count, frames };
}
