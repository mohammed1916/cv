export const python = [
  "def countKeyChanges(s):",
  "    changes = 0",
  "    for i in range(1, len(s)):",
  "        if s[i].lower() != s[i - 1].lower():",
  "            changes += 1",
  "    return changes",
].join("\n");

export const code = [
  "changes = 0",
  "for each position i from 1 to the end",
  "compare s[i] and s[i - 1] after lowercasing both",
  "if they differ, add 1 to changes",
  "return changes",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"s": "aAbBcC"}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with an "s" string.');
  const { s } = data;
  if (typeof s !== "string") throw new Error("s must be a string.");
  if (s.length < 1 || s.length > 100) throw new Error("s must have 1 to 100 characters.");
  if (!/^[A-Za-z]+$/.test(s)) throw new Error("s must contain English letters only.");
  return { s };
}

export function buildTrace(input) {
  const { s } = input;
  let changes = 0;
  const frames = [];
  const push = (f) => frames.push({ seq: s.split(""), index: 0, stats: { changes }, ...f });
  push({ phase: "init", activeLine: 1, pythonLine: 2, message: "Start with zero key changes." });
  for (let i = 1; i < s.length; i++) {
    const prev = s[i - 1].toLowerCase();
    const cur = s[i].toLowerCase();
    push({ phase: "scan", activeLine: 3, pythonLine: 4, index: i, stats: { prev: s[i - 1], cur: s[i], changes }, message: `Compare ${s[i - 1]} and ${s[i]} ignoring case.` });
    if (cur !== prev) {
      changes += 1;
      push({ phase: "count", activeLine: 4, pythonLine: 5, index: i, stats: { prev: s[i - 1], cur: s[i], changes }, message: `Different keys: changes is now ${changes}.` });
    }
  }
  push({ phase: "done", activeLine: 5, pythonLine: 6, index: -1, stats: { changes }, message: `Return ${changes}.` });
  return { input, result: changes, frames };
}
