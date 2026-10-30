export const python = [
  "def countOfPairs(n, x, y):",
  "    ans = [0] * n",
  "    for i in range(1, n + 1):",
  "        for j in range(i + 1, n + 1):",
  "            d = min(j - i, abs(i - x) + 1 + abs(y - j), abs(i - y) + 1 + abs(x - j))",
  "            ans[d - 1] += 2",
  "    return ans",
].join("\n");

export const code = [
  "ans = zero counts for distances 1 to n",
  "for each house pair i < j",
  "d = shortest distance using the direct street or the extra street",
  "add 2 ordered pairs to ans[d]",
  "return ans",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"n": 5, "x": 2, "y": 4}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "n", "x" and "y".');
  const { n, x, y } = data;
  if (![n, x, y].every(Number.isInteger)) throw new Error("n, x and y must be integers.");
  if (n < 2 || n > 30) throw new Error("n must be from 2 to 30 for this visualization (LeetCode allows up to 100).");
  if (x < 1 || x > n || y < 1 || y > n) throw new Error(`x and y must be from 1 to ${n}.`);
  return { n, x, y };
}

export function buildTrace(input) {
  const { n, x, y } = input;
  const ans = Array(n).fill(0);
  const frames = [];
  const push = (f) => frames.push({ seq: [...ans], index: -1, stats: { n, x, y }, ...f });
  push({ phase: "init", activeLine: 1, pythonLine: 2, message: `Start with ${n} zero counts; extra street ${x}-${y}.` });
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const d = Math.min(j - i, Math.abs(i - x) + 1 + Math.abs(y - j), Math.abs(i - y) + 1 + Math.abs(x - j));
      ans[d - 1] += 2;
      push({ phase: "pair", activeLine: 4, pythonLine: 6, index: d - 1, stats: { i, j, d }, message: `Pair (${i}, ${j}) has shortest distance ${d}; add 2 ordered pairs.` });
    }
  }
  push({ phase: "done", activeLine: 5, pythonLine: 7, index: -1, message: "Return the counts for distances 1 to n." });
  return { input, result: ans, frames };
}
