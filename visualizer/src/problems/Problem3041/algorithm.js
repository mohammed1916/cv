export const meta = {
  number: "3041",
  title: "Maximize Consecutive Elements in an Array After Modification",
  slug: "maximize-consecutive-elements-in-an-array-after-modification",
  difficulty: "Medium",
  tags: ["Array", "Hash Table", "Sorting", "Dynamic Programming"],
  description: "Sort the values, then track the longest consecutive run ending at each value, allowing each element to stay or grow by 1.",
  accent: "#f59e0b",
};

export const PYTHON_LINES = [
  "def maxSelectedElements(nums):",
  "    best = {}",
  "    ans = 0",
  "    for x in sorted(nums):",
  "        cand = {}",
  "        for v in (x, x + 1):",
  "            cand[v] = best.get(v - 1, 0) + 1",
  "        for v, length in cand.items():",
  "            best[v] = max(best.get(v, 0), length)",
  "            ans = max(ans, best[v])",
  "    return ans",
];

export const CODE = `function maxSelectedElements(nums) {
  const best = new Map()
  let ans = 0
  for (const x of [...nums].sort((a, b) => a - b)) {
    const cand = new Map()
    for (const v of [x, x + 1]) cand.set(v, (best.get(v - 1) ?? 0) + 1)
    for (const [v, length] of cand) {
      best.set(v, Math.max(best.get(v) ?? 0, length))
      ans = Math.max(ans, best.get(v))
    }
  }
  return ans
}`.split('\n');
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
const L = k => { const i = code.findIndex(c => c.text.includes(k)); if (i < 0) throw new Error('No code line: ' + k); return i + 1 };
export const python = PYTHON_LINES.join("\n");

export const pythonLineMap = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11,
};

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Input must be JSON, e.g. {"nums": [3,1,6]}');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with key nums");
  }
  const { nums } = data;
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) {
    throw new Error("nums must be an array with 1 to 30 elements (visualization cap)");
  }
  if (!nums.every((x) => Number.isInteger(x) && x >= 1 && x <= 60)) {
    throw new Error("Each nums[i] must be an integer from 1 to 60 (visualization cap)");
  }
  return { nums: [...nums] };
}

export function buildTrace(input) {
  const { nums } = parseInput(input);
  const sorted = [...nums].sort((a, b) => a - b);
  const best = new Map();
  let ans = 0;
  const frames = [];

  const snapshot = () => Object.fromEntries([...best.entries()].sort((a, b) => a[0] - b[0]));
  const push = (f) =>
    frames.push({
      phase: f.phase,
      activeLine: f.activeLine,
      pythonLine: f.pythonLine,
      message: f.message,
      explanation: f.explanation ?? f.message,
      nums: [...nums],
      sorted: [...sorted],
      index: f.index ?? -1,
      x: f.x ?? null,
      cand: f.cand ? { ...f.cand } : null,
      best: snapshot(),
      ans,
      result: f.result ?? null,
    });

  push({ phase: "init", activeLine: L('const best = new Map()'), pythonLine: 2, message: "best is empty: no runs yet." });
  push({ phase: "init", activeLine: L('let ans = 0'), pythonLine: 3, message: "ans = 0." });

  for (let index = 0; index < sorted.length; index++) {
    const x = sorted[index];
    push({ phase: "loop", activeLine: L('for (const x of'), pythonLine: 4, index, x, message: `Take x = ${x} from the sorted array (position ${index}).` });
    const cand = {};
    push({ phase: "loop", activeLine: L('const cand = new Map()'), pythonLine: 5, index, x, message: "cand = {}." });
    for (const v of [x, x + 1]) {
      cand[v] = (best.get(v - 1) ?? 0) + 1;
      push({
        phase: "candidate",
        activeLine: L('cand.set(v, '),
        pythonLine: 7,
        index,
        x,
        cand: { ...cand },
        message: `x can become ${v}. Run ending at ${v} = best[${v - 1}] + 1 = ${cand[v]}.`,
      });
    }
    for (const [v, length] of Object.entries(cand).map(([k, l]) => [Number(k), l])) {
      const prev = best.get(v) ?? 0;
      best.set(v, Math.max(prev, length));
      push({
        phase: "update",
        activeLine: L('for (const [v, length] of cand)'),
        pythonLine: 9,
        index,
        x,
        cand: { ...cand },
        message: `best[${v}] = max(${prev}, ${length}) = ${best.get(v)}.`,
      });
      ans = Math.max(ans, best.get(v));
      push({
        phase: "update",
        activeLine: L('best.set(v,'),
        pythonLine: 10,
        index,
        x,
        cand: { ...cand },
        message: `ans = max(ans, best[${v}]) = ${ans}.`,
      });
    }
  }

  push({ phase: "done", activeLine: L('ans = Math.max(ans, best.get(v))'), pythonLine: 11, result: ans, message: `Return ans = ${ans}.` });
  return { input: { nums }, result: ans, frames };
}

export const sampleInputs = [
  { label: "Example 1", input: { nums: [5, 1, 2, 2, 8] } },
  { label: "Example 2", input: { nums: [9, 3, 3, 4, 10, 2] } },
];
