export const python = [
  "def maximumLength(s):",
  "    top = [[] for _ in range(26)]",
  "    i = 0",
  "    while i < len(s):",
  "        j = i",
  "        while j < len(s) and s[j] == s[i]:",
  "            j += 1",
  "        c = ord(s[i]) - ord('a')",
  "        r = j - i",
  "        for length in (r, r - 1, r - 2):",
  "            if length > 0:",
  "                top[c].append(length)",
  "                top[c].sort(reverse=True)",
  "                top[c] = top[c][:3]",
  "        i = j",
  "    ans = -1",
  "    for c in range(26):",
  "        if len(top[c]) == 3:",
  "            ans = max(ans, top[c][2])",
  "    return ans",
].join("\n");

export const code = [
  "keep the three largest candidate lengths for each letter",
  "i = 0",
  "while i is inside s",
  "find the run [i, j) of the same letter",
  "c = letter of s[i]; r = run length",
  "for each length in r, r - 1, r - 2 that is positive",
  "insert length into top[c] and keep the three largest",
  "i = j",
  "ans = -1",
  "for each letter that has three candidates",
  "ans = max(ans, third candidate of that letter)",
  "return ans",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"s": "aaaa"}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with an "s" string.');
  const { s } = data;
  if (typeof s !== "string") throw new Error("s must be a string.");
  if (s.length < 3 || s.length > 60) throw new Error("s must have 3 to 60 characters for this visualization.");
  if (!/^[a-z]+$/.test(s)) throw new Error("s must contain lowercase English letters only.");
  return { s };
}

export function buildTrace(input) {
  const { s } = input;
  const top = Array.from({ length: 26 }, () => []);
  const frames = [];
  const push = (f) => frames.push({ seq: s.split(""), index: -1, stats: {}, ...f });
  push({ phase: "init", activeLine: 1, pythonLine: 2, index: 0, message: "Create an empty list of top candidate lengths for each letter." });
  let i = 0;
  while (i < s.length) {
    push({ phase: "scan", activeLine: 2, pythonLine: 4, index: i, message: `Start a run at index ${i}.` });
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    const c = s.charCodeAt(i) - 97;
    const r = j - i;
    push({ phase: "run", activeLine: 3, pythonLine: 8, index: i, stats: { letter: s[i], run: r }, message: `Run of '${s[i]}' covers [${i}, ${j - 1}], length ${r}.` });
    for (const length of [r, r - 1, r - 2]) {
      if (length <= 0) continue;
      top[c].push(length);
      top[c].sort((a, b) => b - a);
      top[c] = top[c].slice(0, 3);
      push({ phase: "candidate", activeLine: 4, pythonLine: 12, index: i, stats: { letter: s[i], length, top: top[c].join(",") }, message: `Candidate length ${length} for '${s[i]}'; keep the three largest.` });
    }
    i = j;
  }
  let ans = -1;
  for (let c = 0; c < 26; c++) {
    if (top[c].length === 3) {
      ans = Math.max(ans, top[c][2]);
      push({ phase: "answer", activeLine: 5, pythonLine: 19, index: -1, stats: { letter: String.fromCharCode(97 + c), third: top[c][2], ans }, message: `Letter '${String.fromCharCode(97 + c)}' has third candidate ${top[c][2]}; best so far ${ans}.` });
    }
  }
  push({ phase: "done", activeLine: 6, pythonLine: 20, index: -1, stats: { ans }, message: `Return ${ans}.` });
  return { input, result: ans, frames };
}
