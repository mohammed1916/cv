const PYTHON_LINES = [
  "def find_latest_step(arr, m):",
  "    n = len(arr)",
  "    run_end = [0] * (n + 2)",
  "    groups_of_m = 0",
  "    last = -1",
  "    for step in range(1, n + 1):",
  "        pos = arr[step - 1]",
  "        left = run_end[pos - 1]",
  "        right = run_end[pos + 1]",
  "        if left == m:",
  "            groups_of_m -= 1",
  "        if right == m:",
  "            groups_of_m -= 1",
  "        total = left + right + 1",
  "        run_end[pos - left] = total",
  "        run_end[pos + right] = total",
  "        if total == m:",
  "            groups_of_m += 1",
  "        if groups_of_m > 0:",
  "            last = step",
  "    return last",
];

const CODE = [
  "FUNCTION findLatestStep(arr, m)",
  "    n ← length of arr",
  "    runEnd ← zeros of length n + 2 (run length stored at run endpoints)",
  "    groupsOfM ← 0",
  "    last ← −1",
  "    FOR step FROM 1 THROUGH n",
  "        pos ← arr[step]; that bit becomes 1",
  "        left ← runEnd[pos − 1]; right ← runEnd[pos + 1]",
  "        IF left = m, groupsOfM ← groupsOfM − 1",
  "        IF right = m, groupsOfM ← groupsOfM − 1",
  "        total ← left + right + 1",
  "        runEnd[pos − left] ← total",
  "        runEnd[pos + right] ← total",
  "        IF total = m, groupsOfM ← groupsOfM + 1",
  "        IF groupsOfM > 0, last ← step",
  "    RETURN last",
];

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Input must be valid JSON, e.g. {"arr":[3,5,1,2,4],"m":1}');
  }
}

export function parseInput(text) {
  const input = typeof text === "string" ? parseJson(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with arr and m, e.g. {"arr":[3,5,1,2,4],"m":1}');
  }
  const { arr, m } = input;
  if (!Array.isArray(arr)) throw new Error("arr must be an array");
  const n = arr.length;
  if (n < 1 || n > 50) throw new Error(`arr length ${n} must be between 1 and 50 for the visualization`);
  const seen = new Set();
  for (const value of arr) {
    if (!Number.isInteger(value) || value < 1 || value > n) throw new Error(`arr values must be integers from 1 to ${n}; found ${value}`);
    if (seen.has(value)) throw new Error(`arr values must be distinct; ${value} repeats`);
    seen.add(value);
  }
  if (!Number.isInteger(m) || m < 1 || m > n) throw new Error(`m must be an integer from 1 to ${n}`);
  return { arr: [...arr], m };
}

export function buildTrace(input) {
  const { arr, m } = input;
  const n = arr.length;
  const runEnd = new Array(n + 2).fill(0);
  const bits = new Array(n).fill(0);
  let groupsOfM = 0;
  let last = -1;
  let state = {};
  const frames = [];
  const frame = (activeLine, phase, message, extra = {}) => frames.push({
    activeLine, phase, message, bits: [...bits], runEnd: [...runEnd], groupsOfM, last, m, n, active: -1, ...state, ...extra,
  });

  frame(5, "init", `Start with ${n} zeros, no runs, and last = -1.`);
  for (let step = 1; step <= n; step++) {
    const pos = arr[step - 1];
    bits[pos - 1] = 1;
    state = { step, pos, active: pos - 1 };
    frame(7, "loop", `Step ${step}: bit ${pos} becomes 1.`);
    const left = runEnd[pos - 1];
    const right = runEnd[pos + 1];
    state = { step, pos, left, right, active: pos - 1 };
    frame(8, "merge", `Run ending at ${pos - 1} has length ${left}; run starting at ${pos + 1} has length ${right}.`);
    if (left === m) groupsOfM -= 1;
    frame(9, "count", left === m ? `Left run has length m, so it is no longer a group of exactly m: groups of m = ${groupsOfM}.` : `Left run length ${left} is not m; no change.`);
    if (right === m) groupsOfM -= 1;
    frame(10, "count", right === m ? `Right run has length m, so it is no longer a group of exactly m: groups of m = ${groupsOfM}.` : `Right run length ${right} is not m; no change.`);
    const total = left + right + 1;
    state = { step, pos, left, right, total, active: pos - 1 };
    frame(11, "merge", `Merged run length is ${left} + ${right} + 1 = ${total}.`);
    runEnd[pos - left] = total;
    frame(12, "merge", `Store ${total} at the left endpoint ${pos - left}.`);
    runEnd[pos + right] = total;
    frame(13, "merge", `Store ${total} at the right endpoint ${pos + right}.`);
    if (total === m) groupsOfM += 1;
    frame(14, "count", total === m ? `The merged run has length m: groups of m = ${groupsOfM}.` : `The merged run length ${total} is not m.`);
    if (groupsOfM > 0) last = step;
    frame(15, "check", groupsOfM > 0 ? `A run of length m exists, so last = ${step}.` : `No run of length m exists yet; last stays ${last}.`);
  }
  state = {};
  frame(16, "done", `Return ${last}.`, { result: last });

  return { input: { arr, m }, result: last, frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const pythonLineMap = { 5: 5, 7: 7, 8: 8, 9: 10, 10: 12, 11: 14, 12: 15, 13: 16, 14: 17, 15: 19, 16: 21 };
