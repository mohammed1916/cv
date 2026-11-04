const PYTHON_LINES = [
  "def splitMessage(message, limit):",
  "    n = len(message)",
  "    digit_total = 0",
  "    for k in range(1, n + 1):",
  "        dk = len(str(k))",
  "        digit_total += dk",
  "        base = limit - 3 - dk",
  "        if base - dk < 1:",
  "            continue",
  "        total_cap = k * base - digit_total",
  "        prefix_cap = (k - 1) * base - (digit_total - dk)",
  "        if prefix_cap < n <= total_cap:",
  "            parts = []",
  "            pos = 0",
  "            for i in range(1, k + 1):",
  "                suffix = f\"<{i}/{k}>\"",
  "                take = min(limit - len(suffix), n - pos)",
  "                parts.append(message[pos:pos + take] + suffix)",
  "                pos += take",
  "            return parts",
  "    return []",
];

const CODE_LINES = [
  "function splitMessage(message, limit) {",
  "  const n = message.length",
  "  let digitTotal = 0",
  "  for (let k = 1; k <= n; k++) {",
  "    const dk = String(k).length",
  "    digitTotal += dk",
  "    const base = limit - 3 - dk",
  "    if (base - dk < 1) continue",
  "    const totalCap = k * base - digitTotal",
  "    const prefixCap = (k - 1) * base - (digitTotal - dk)",
  "    if (prefixCap < n && n <= totalCap) {",
  "      const parts = []",
  "      let pos = 0",
  "      for (let i = 1; i <= k; i++) {",
  "        const suffix = `<${i}/${k}>`",
  "        const take = Math.min(limit - suffix.length, n - pos)",
  "        parts.push(message.slice(pos, pos + take) + suffix)",
  "        pos += take",
  "      }",
  "      return parts",
  "    }",
  "  }",
  "  return []",
  "}",
];

const MAX_LENGTH = 50;
const MAX_LIMIT = 50;


const codeLine = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text.trim()));
  if (index < 0) throw new Error(`Code line for "${text}" is missing`);
  return index + 1;
};

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"message": "short message", "limit": 15}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with message and limit keys");
  const { message, limit } = obj;
  if (typeof message !== "string" || message.length < 1 || message.length > MAX_LENGTH) {
    throw new Error(`message must be a string of between 1 and ${MAX_LENGTH} characters for this visualization`);
  }
  if (!/^[a-z ]+$/.test(message)) throw new Error("message must contain only lowercase letters and spaces");
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) throw new Error(`limit must be an integer from 1 to ${MAX_LIMIT}`);
  return { message, limit };
}

export function buildTrace(input) {
  const { message, limit } = input.message !== undefined ? input : parseInput(input);
  const n = message.length;
  const frames = [];
  let parts = [];
  let pos = 0;
  let k = 0;
  let digitTotal = 0;
  let base = 0;
  const snap = (phase, activeLine, pyKey, msg, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message: msg, n, k, dk: 0, base, pos, digitTotal, parts: [...parts], ...extra,
  });

  snap("setup", codeLine("const n = message.length"), "n = len(message)", `The message has ${n} character(s).`);
  snap("setup", codeLine("let digitTotal = 0"), "digit_total = 0", "No digits have been counted yet.");
  let result = null;
  for (k = 1; k <= n && result === null; k++) {
    snap("try", codeLine("for (let k = 1"), "for k in range", `Try splitting into ${k} part(s).`, { k });
    const dk = String(k).length;
    digitTotal += dk;
    snap("digits", codeLine("const dk = String(k).length"), "dk = len(str(k))", `${k} has ${dk} digit(s), so each suffix needs room for it.`, { k, dk });
    snap("digits", codeLine("digitTotal += dk"), "digit_total += dk", `The digit total for parts 1 to ${k} is ${digitTotal}.`, { k, dk, digitTotal });
    base = limit - 3 - dk;
    snap("room", codeLine("const base = limit"), "base = limit - 3 - dk", `Each part has ${base} character(s) before its index digits.`, { k, dk, base });
    if (base - dk < 1) {
      snap("skip", codeLine("if (base - dk < 1) continue"), "if base - dk < 1", `The last part would have no room for message text, so ${k} parts fail.`, { k, dk, base });
      continue;
    }
    const totalCap = k * base - digitTotal;
    const prefixCap = (k - 1) * base - (digitTotal - dk);
    snap("capacity", codeLine("const totalCap = k * base"), "total_cap = k * base", `Capacity for ${k} parts is ${totalCap}; the first ${k - 1} full parts hold ${prefixCap}.`, { k, dk, base, totalCap, prefixCap });
    if (prefixCap < n && n <= totalCap) {
      snap("accept", codeLine("const parts = []"), "parts = []", `The message fits in ${k} parts. Build them.`, { k });
      parts = [];
      pos = 0;
      for (let i = 1; i <= k; i++) {
        const suffix = `<${i}/${k}>`;
        const take = Math.min(limit - suffix.length, n - pos);
        snap("part", codeLine("const take = Math.min"), "for i in range(1, k + 1)", `Part ${i} takes ${take} character(s).`, { k, i, take });
        parts.push(message.slice(pos, pos + take) + suffix);
        pos += take;
        snap("part", codeLine("parts.push(message.slice"), "parts.append", `Part ${i} is "${parts[i - 1]}".`, { k, i, take });
      }
      result = [...parts];
      snap("done", codeLine("return parts"), "return parts", `Return ${k} part(s).`, { k, result });
      break;
    }
    snap("reject", codeLine("if (prefixCap < n && n <= totalCap)"), "if prefix_cap < n <= total_cap", `${n} characters do not fit exactly in ${k} parts.`, { k, dk, base, totalCap, prefixCap });
  }
  if (result === null) {
    snap("done", codeLine("return []"), "return []", "No number of parts works, so return an empty list.", { k: n, result: [] });
    result = [];
  }
  return { input: { message, limit }, result, frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
