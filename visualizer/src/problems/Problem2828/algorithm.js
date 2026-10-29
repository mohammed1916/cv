const PYTHON_LINES = [
  "def isAcronym(words, s):",
  "    if len(words) != len(s):",
  "        return False",
  "    for i, word in enumerate(words):",
  "        if word[0] != s[i]:",
  "            return False",
  "    return True",
];

const CODE_LINES = [
  "if the number of words differs from length of s",
  "  return false",
  "for i from 0 to number of words - 1",
  "  if first letter of words[i] differs from s[i]",
  "    return false",
  "return true",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with words and s.");
  const { words, s } = input;
  if (!Array.isArray(words) || words.length < 1 || words.length > 100) throw new Error("words must be an array of 1 to 100 strings.");
  if (!words.every(w => typeof w === "string" && /^[a-z]{1,10}$/.test(w))) throw new Error("Each word must be 1 to 10 lowercase letters.");
  if (typeof s !== "string" || s.length < 1 || s.length > 100 || !/^[a-z]+$/.test(s)) throw new Error("s must be 1 to 100 lowercase letters.");
  return { words, s };
}

export function buildTrace(input) {
  const { words, s } = parseInput(input);
  const frames = [];
  const roles = () => Array(words.length).fill("");
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: words, active: -1, roles: roles(), detail: "", ...extra,
  });

  push("length", 1, py("if len(words) != len(s):"),
    `Compare ${words.length} words with s of length ${s.length}.`, { detail: `${words.length} vs ${s.length}` });
  if (words.length !== s.length) {
    push("result", 2, py("return False"), "Lengths differ, so s cannot be an acronym.", { detail: "return false" });
    return { input: { words, s }, result: false, frames };
  }

  for (let i = 0; i < words.length; i += 1) {
    const r = roles(); r[i] = "current";
    push("scan", 3, py("for i, word in enumerate(words):"), `Check word ${i}: "${words[i]}".`, { active: i, roles: r });
    const ok = words[i][0] === s[i];
    const mark = roles(); mark[i] = ok ? "match" : "mismatch";
    push("compare", 4, py("if word[0] != s[i]:"),
      `First letter "${words[i][0]}" versus s[${i}] = "${s[i]}": ${ok ? "same" : "different"}.`,
      { active: i, roles: mark, detail: `${words[i][0]} vs ${s[i]}` });
    if (!ok) {
      push("result", 5, py("return False"), `Mismatch at index ${i}, so the answer is false.`, { active: i, roles: mark, detail: "return false" });
      return { input: { words, s }, result: false, frames };
    }
  }
  push("result", 6, py("return True"), "Every word's first letter matches s, so the answer is true.", { detail: "return true" });
  return { input: { words, s }, result: true, frames };
}
