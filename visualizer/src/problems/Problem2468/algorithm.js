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
  "FUNCTION splitMessage(message, limit)",
  "  n <- length of message; digitTotal <- 0",
  "  FOR k from 1 to n",
  "    dk <- number of digits in k; add dk to digitTotal",
  "    base <- limit - 3 - dk",
  "    IF base - dk < 1 THEN skip this k",
  "    totalCap <- k * base - digitTotal",
  "    prefixCap <- (k - 1) * base - (digitTotal - dk)",
  "    IF prefixCap < n and n <= totalCap THEN",
  "      FOR i from 1 to k, fill part i up to its limit",
  "        the last part takes the remaining characters",
  "      RETURN the parts",
  "  RETURN an empty list",
];

const MAX_LENGTH = 50;
const MAX_LIMIT = 50;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

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
    phase, activeLine, pythonLine: py(pyKey), message: msg, n, k, dk: 0, base, pos, parts: [...parts], ...extra,
  });

  snap("setup", 2, "n = len(message)", `The message has ${n} character(s).`);
  snap("setup", 2, "digit_total = 0", "No digits have been counted yet.");
  let result = null;
  for (k = 1; k <= n && result === null; k++) {
    snap("try", 4, "for k in range", `Try splitting into ${k} part(s).`, { k });
    const dk = String(k).length;
    digitTotal += dk;
    snap("digits", 5, "dk = len(str(k))", `${k} has ${dk} digit(s), so each suffix needs room for it.`, { k, dk });
    snap("digits", 5, "digit_total += dk", `The digit total for parts 1 to ${k} is ${digitTotal}.`, { k, dk, digitTotal });
    base = limit - 3 - dk;
    snap("room", 6, "base = limit - 3 - dk", `Each part has ${base} character(s) before its index digits.`, { k, dk, base });
    if (base - dk < 1) {
      snap("skip", 7, "if base - dk < 1", `The last part would have no room for message text, so ${k} parts fail.`, { k, dk, base });
      continue;
    }
    const totalCap = k * base - digitTotal;
    const prefixCap = (k - 1) * base - (digitTotal - dk);
    snap("capacity", 10, "total_cap = k * base", `Capacity for ${k} parts is ${totalCap}; the first ${k - 1} full parts hold ${prefixCap}.`, { k, dk, base, totalCap, prefixCap });
    if (prefixCap < n && n <= totalCap) {
      snap("accept", 12, "parts = []", `The message fits in ${k} parts. Build them.`, { k });
      parts = [];
      pos = 0;
      for (let i = 1; i <= k; i++) {
        const suffix = `<${i}/${k}>`;
        const take = Math.min(limit - suffix.length, n - pos);
        snap("part", 15, "for i in range(1, k + 1)", `Part ${i} takes ${take} character(s).`, { k, i, take });
        parts.push(message.slice(pos, pos + take) + suffix);
        pos += take;
        snap("part", 18, "parts.append", `Part ${i} is "${parts[i - 1]}".`, { k, i, take });
      }
      result = [...parts];
      snap("done", 20, "return parts", `Return ${k} part(s).`, { k, result });
      break;
    }
    snap("reject", 11, "if prefix_cap < n <= total_cap", `${n} characters do not fit exactly in ${k} parts.`, { k, dk, base, totalCap, prefixCap });
  }
  if (result === null) {
    snap("done", 21, "return []", "No number of parts works, so return an empty list.", { k: n, result: [] });
    result = [];
  }
  return { input: { message, limit }, result, frames };
}
