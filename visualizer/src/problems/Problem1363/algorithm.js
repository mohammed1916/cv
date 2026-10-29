const PYTHON_LINES = [
  "def largestMultipleOfThree(digits):",
  "    cnt = [0] * 10",
  "    for d in digits:",
  "        cnt[d] += 1",
  "    rem = sum(digits) % 3",
  "    def drop(mod, k):",
  "        for d in range(10):",
  "            if d % 3 == mod and k > 0:",
  "                t = min(k, cnt[d])",
  "                cnt[d] -= t",
  "                k -= t",
  "        return k",
  "    if rem == 1:",
  "        if drop(1, 1) != 0:",
  "            if drop(2, 2) != 0:",
  "                return \"\"",
  "    elif rem == 2:",
  "        if drop(2, 1) != 0:",
  "            if drop(1, 2) != 0:",
  "                return \"\"",
  "    parts = []",
  "    for d in range(9, -1, -1):",
  "        parts.append(str(d) * cnt[d])",
  "    result = \"\".join(parts)",
  "    if result == \"\":",
  "        return \"\"",
  "    if result[0] == \"0\":",
  "        return \"0\"",
  "    return result",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "cnt[d] = how many times digit d appears, for d = 0..9" },
  { line: 2, text: "rem = (sum of digits) mod 3" },
  { line: 3, text: "if rem is 1: drop one smallest digit with mod 1, else two smallest with mod 2" },
  { line: 4, text: "if rem is 2: drop one smallest digit with mod 2, else two smallest with mod 1" },
  { line: 5, text: "if a needed drop is impossible: return empty string" },
  { line: 6, text: "build the number from digit 9 down to 0 using cnt" },
  { line: 7, text: "if empty return empty string; if it starts with 0 return \"0\"" },
  { line: 8, text: "return the built number" },
];

export const pythonLineMap = { 1: 3, 2: 5, 3: 13, 4: 16, 5: 15, 6: 21, 7: 23, 8: 25 };

export const examples = [
  { label: "[8,1,9]", input: '{"digits":[8,1,9]}' },
  { label: "[8,6,7,1,0]", input: '{"digits":[8,6,7,1,0]}' },
  { label: "[1]", input: '{"digits":[1]}' },
  { label: "All zeros", input: '{"digits":[0,0,0,0,0,0]}' },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"digits":[8,1,9]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with a digits array");
  const { digits } = data;
  if (!Array.isArray(digits) || digits.length < 1) throw new Error("digits must be a non-empty array");
  if (digits.length > 50) throw new Error(`digits has ${digits.length} values; the visualization caps it at 50`);
  digits.forEach((d, i) => {
    if (!Number.isInteger(d) || d < 0 || d > 9) throw new Error(`digits[${i}] must be an integer from 0 to 9`);
  });
  return { digits: [...digits] };
}

export function buildTrace(input) {
  const digits = input.digits;
  const cnt = Array(10).fill(0);
  const frames = [];
  const removed = [];
  const snap = () => [...cnt];
  digits.forEach((d, i) => {
    cnt[d] += 1;
    frames.push({ phase: "count", activeLine: 1, message: `Count digit ${d}.`, focus: d, cnt: snap(), removed: [], result: null, rem: null });
  });
  const total = digits.reduce((s, d) => s + d, 0);
  const rem = total % 3;
  frames.push({ phase: "count", activeLine: 2, message: `Digit sum is ${total}, so the remainder mod 3 is ${rem}.`, focus: null, cnt: snap(), removed: [], result: null, rem });
  let fail = false;
  const drop = (mod, k) => {
    for (let d = 0; d < 10; d++) {
      if (d % 3 === mod && k > 0) {
        const t = Math.min(k, cnt[d]);
        cnt[d] -= t;
        k -= t;
        for (let x = 0; x < t; x++) removed.push(d);
      }
    }
    return k;
  };
  if (rem === 1) {
    frames.push({ phase: "drop", activeLine: 3, message: "Remainder 1: drop one smallest digit with mod 1, else two smallest with mod 2.", focus: null, cnt: snap(), removed: [], result: null, rem });
    if (drop(1, 1) !== 0) {
      if (drop(2, 2) !== 0) fail = true;
    }
  } else if (rem === 2) {
    frames.push({ phase: "drop", activeLine: 4, message: "Remainder 2: drop one smallest digit with mod 2, else two smallest with mod 1.", focus: null, cnt: snap(), removed: [], result: null, rem });
    if (drop(2, 1) !== 0) {
      if (drop(1, 2) !== 0) fail = true;
    }
  }
  if (fail) {
    frames.push({ phase: "done", activeLine: 5, message: "Not enough digits to fix the remainder; the answer is empty.", focus: null, cnt: snap(), removed: [...removed], result: "", rem });
    return { input, result: "", frames };
  }
  if (rem !== 0) {
    frames.push({ phase: "drop", activeLine: 3, message: `Dropped ${JSON.stringify(removed)}.`, focus: null, cnt: snap(), removed: [...removed], result: null, rem });
  }
  let result = "";
  for (let d = 9; d >= 0; d--) result += String(d).repeat(cnt[d]);
  frames.push({ phase: "build", activeLine: 6, message: `Built ${result === "" ? "nothing" : result} from the counts.`, focus: null, cnt: snap(), removed: [...removed], result: null, rem });
  if (result === "") {
    result = "";
  } else if (result[0] === "0") {
    result = "0";
  }
  frames.push({ phase: "done", activeLine: 8, message: `Return "${result}".`, focus: null, cnt: snap(), removed: [...removed], result, rem });
  return { input, result, frames };
}
