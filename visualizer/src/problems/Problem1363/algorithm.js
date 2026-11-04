// Teaching model written for this visualizer. The sample digits and wording are original.
const CODE = [
  'function largestMultipleOfThree(digits) {',
  '  const cnt = Array(10).fill(0)',
  '  for (const d of digits) cnt[d] += 1',
  '  const rem = digits.reduce((s, d) => s + d, 0) % 3',
  '  const drop = (mod, k) => {',
  '    for (let d = 0; d < 10; d++) {',
  '      if (d % 3 === mod && k > 0) { const t = Math.min(k, cnt[d]); cnt[d] -= t; k -= t }',
  '    }',
  '    return k',
  '  }',
  '  if (rem === 1 && drop(1, 1) !== 0 && drop(2, 2) !== 0) return \'\'',
  '  if (rem === 2 && drop(2, 1) !== 0 && drop(1, 2) !== 0) return \'\'',
  '  let result = \'\'',
  '  for (let d = 9; d >= 0; d--) result += String(d).repeat(cnt[d])',
  '  if (result === \'\') return \'\'',
  '  return result[0] === \'0\' ? \'0\' : result',
  '}',
]
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
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 11, 10: 13, 11: 17, 12: 21, 13: 22, 14: 25, 15: 27, 16: 29 };
const L = text => {
  const index = CODE.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}

export const examples = [
  { label: "[7,4,2,9]", input: '{"digits":[7,4,2,9]}' },
  { label: "[5,3,0,6,2,4]", input: '{"digits":[5,3,0,6,2,4]}' },
  { label: "[2,8]", input: '{"digits":[2,8]}' },
  { label: "Zeros after a drop", input: '{"digits":[4,0,0,0,0]}' },
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
    frames.push({ phase: "count", activeLine: L('cnt[d] += 1'), pythonLine: 4, message: `Count digit ${d}.`, focus: d, cnt: snap(), removed: [], result: null, rem: null });
  });
  const total = digits.reduce((s, d) => s + d, 0);
  const rem = total % 3;
  frames.push({ phase: "count", activeLine: L('const rem'), pythonLine: 5, message: `Digit sum is ${total}, so the remainder mod 3 is ${rem}.`, focus: null, cnt: snap(), removed: [], result: null, rem });
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
    frames.push({ phase: "drop", activeLine: L('if (rem === 1'), pythonLine: 13, message: "Remainder 1: drop one smallest digit with mod 1, else two smallest with mod 2.", focus: null, cnt: snap(), removed: [], result: null, rem });
    if (drop(1, 1) !== 0) {
      if (drop(2, 2) !== 0) fail = true;
    }
  } else if (rem === 2) {
    frames.push({ phase: "drop", activeLine: L('if (rem === 2'), pythonLine: 17, message: "Remainder 2: drop one smallest digit with mod 2, else two smallest with mod 1.", focus: null, cnt: snap(), removed: [], result: null, rem });
    if (drop(2, 1) !== 0) {
      if (drop(1, 2) !== 0) fail = true;
    }
  }
  if (fail) {
    frames.push({ phase: "done", activeLine: L("if (rem === 1"), pythonLine: 16, message: "Not enough digits to fix the remainder; the answer is empty.", focus: null, cnt: snap(), removed: [...removed], result: "", rem });
    return { input, result: "", frames };
  }
  if (rem !== 0) {
    frames.push({ phase: "drop", activeLine: L('const drop'), pythonLine: 9, message: `Dropped ${JSON.stringify(removed)}.`, focus: null, cnt: snap(), removed: [...removed], result: null, rem });
  }
  let result = "";
  for (let d = 9; d >= 0; d--) result += String(d).repeat(cnt[d]);
  frames.push({ phase: "build", activeLine: L('let result'), pythonLine: 24, message: `Built ${result === "" ? "nothing" : result} from the counts.`, focus: null, cnt: snap(), removed: [...removed], result: null, rem });
  if (result === "") {
    result = "";
  } else if (result[0] === "0") {
    result = "0";
  }
  frames.push({ phase: "done", activeLine: L("return result[0]"), pythonLine: 29, message: `Return "${result}".`, focus: null, cnt: snap(), removed: [...removed], result, rem });
  return { input, result, frames };
}
