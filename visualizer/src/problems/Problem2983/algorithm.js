export const python = [
  "from collections import Counter",
  "def canMakePalindromeQueries(s, queries):",
  "    n = len(s)",
  "    h = n // 2",
  "    A = s[:h]",
  "    B = s[h:][::-1]",
  "    answers = []",
  "    for a, b, c, d in queries:",
  "        X = set(range(a, b + 1))",
  "        Y = set(range(n - 1 - d, n - c))",
  "        ok = all(A[i] == B[i] for i in range(h) if i not in X and i not in Y)",
  "        if ok:",
  "            left = Counter(A[i] for i in X)",
  "            left.subtract(Counter(B[i] for i in X - Y))",
  "            right = Counter(B[i] for i in Y)",
  "            right.subtract(Counter(A[i] for i in Y - X))",
  "            ok = all(v >= 0 for v in left.values()) and all(v >= 0 for v in right.values()) and +left == +right",
  "        answers.append(ok)",
  "    return answers",
].join("\n");

export const code = [
  "split s: A is the left half, B is the reversed right half",
  "for each query [a, b, c, d]",
  "map the right range to B positions [n-1-d, n-1-c]",
  "for each position outside both ranges",
  "if A[i] differs from B[i], the answer is false",
  "left counts = letters of A on [a, b] minus B letters on X minus Y",
  "right counts = letters of B on Y minus A letters on Y minus X",
  "answer is true if both counts are non-negative and equal",
  "append the answer",
  "return the answers",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"s": "abcabc", "queries": [[1,1,3,5]]}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "s" and "queries".');
  const { s, queries } = data;
  if (typeof s !== "string" || !/^[a-z]+$/.test(s)) throw new Error("s must contain lowercase letters only.");
  if (s.length < 2 || s.length > 50 || s.length % 2 !== 0) throw new Error("s must have an even length from 2 to 50 for this visualization.");
  const h = s.length / 2;
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 20) throw new Error("queries must hold 1 to 20 entries for this visualization.");
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 4 || !q.every(Number.isInteger)) throw new Error("Each query must be [a, b, c, d] with integers.");
    const [a, b, c, d] = q;
    if (!(0 <= a && a <= b && b < h)) throw new Error(`Query [${q}]: need 0 <= a <= b < ${h} (left half).`);
    if (!(h <= c && c <= d && d < s.length)) throw new Error(`Query [${q}]: need ${h} <= c <= d < ${s.length} (right half).`);
  }
  return { s, queries: queries.map(q => [...q]) };
}

const span = (lo, hi) => Array.from({ length: Math.max(0, hi - lo + 1) }, (_, k) => lo + k);
const tally = (letters) => letters.reduce((m, ch) => m.set(ch, (m.get(ch) || 0) + 1), new Map());
function subtractTally(counts, letters) {
  const out = new Map(counts);
  for (const ch of letters) out.set(ch, (out.get(ch) || 0) - 1);
  return out;
}

export function buildTrace(input) {
  const { s, queries } = input;
  const n = s.length;
  const h = n / 2;
  const A = s.slice(0, h);
  const B = s.slice(h).split("").reverse().join("");
  const frames = [];
  const answers = [];
  const push = (f) => frames.push({ seq: A.split("").map((ch, i) => `${ch}|${B[i]}`), index: -1, stats: {}, answers: [...answers], ...f });
  push({ phase: "setup", activeLine: 1, pythonLine: 5, message: `A = left half "${A}", B = reversed right half "${B}".` });
  queries.forEach(([a, b, c, d], qi) => {
    const cp = n - 1 - d;
    const dp = n - 1 - c;
    const X = new Set(span(a, b));
    const Y = new Set(span(cp, dp));
    push({ phase: "query", activeLine: 2, pythonLine: 8, index: a, stats: { query: qi, X: `[${a},${b}]`, Y: `[${cp},${dp}]` }, message: `Query ${qi}: A range [${a},${b}], B range [${cp},${dp}].` });
    let ok = true;
    for (let i = 0; i < h; i++) {
      if (X.has(i) || Y.has(i)) continue;
      if (A[i] !== B[i]) {
        ok = false;
        push({ phase: "fixed", activeLine: 5, pythonLine: 11, index: i, stats: { query: qi, A: A[i], B: B[i] }, message: `Fixed position ${i} mismatches: A=${A[i]}, B=${B[i]}.` });
        break;
      }
    }
    if (ok) {
      const xOnly = span(a, b).filter(i => !Y.has(i));
      const yOnly = span(cp, dp).filter(i => !X.has(i));
      const left = subtractTally(tally(span(a, b).map(i => A[i])), xOnly.map(i => B[i]));
      push({ phase: "counts", activeLine: 6, pythonLine: 13, index: a, stats: { query: qi, left: JSON.stringify(Object.fromEntries(left)) }, message: "Left counts: letters of A on X minus the fixed B letters." });
      const right = subtractTally(tally(span(cp, dp).map(i => B[i])), yOnly.map(i => A[i]));
      push({ phase: "counts", activeLine: 7, pythonLine: 15, index: cp, stats: { query: qi, right: JSON.stringify(Object.fromEntries(right)) }, message: "Right counts: letters of B on Y minus the fixed A letters." });
      const keys = new Set([...left.keys(), ...right.keys()]);
      const nonNegative = [...left.values(), ...right.values()].every(v => v >= 0);
      const equal = [...keys].every(k => (left.get(k) || 0) === (right.get(k) || 0));
      ok = nonNegative && equal;
    }
    answers.push(ok);
    push({ phase: "answer", activeLine: 9, pythonLine: 18, index: qi, stats: { query: qi, ok }, message: `Query ${qi} is ${ok ? "palindromable" : "not palindromable"}.` });
  });
  push({ phase: "done", activeLine: 10, pythonLine: 19, index: -1, stats: { answers: answers.length }, message: "Return one boolean per query." });
  return { input, result: answers, frames };
}
