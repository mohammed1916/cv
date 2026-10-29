export const code = [
  { line: 1, text: "n = length of arr, g = gcd of n and k" },
  { line: 2, text: "ops = 0" },
  { line: 3, text: "for start from 0 to g minus 1" },
  { line: 4, text: "cycle = values at start, start + g, start + 2g, ..." },
  { line: 5, text: "sort cycle and set target to its median" },
  { line: 6, text: "ops = ops + sum of absolute differences from target" },
  { line: 7, text: "return ops" },
];

export const python = `from math import gcd

def makeSubKSumsEqual(arr, k):
    n = len(arr)
    g = gcd(n, k)
    ops = 0
    for start in range(g):
        cycle = sorted(arr[start::g])
        target = cycle[len(cycle) // 2]
        ops += sum(abs(x - target) for x in cycle)
    return ops`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"arr": [1, 4, 1, 3], "k": 2}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with keys arr and k");
  }
  const { arr, k } = data;
  if (!Array.isArray(arr) || arr.length < 1) throw new Error("arr must be a non-empty array of integers");
  if (arr.length > 200) throw new Error(`arr length ${arr.length} exceeds the visualization cap of 200`);
  for (const value of arr) {
    if (!Number.isInteger(value) || value < 1 || value > 1e9) {
      throw new Error("Every arr value must be an integer from 1 to 1000000000");
    }
  }
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error("k must be an integer from 1 to arr.length");
  return { arr: [...arr], k };
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function buildTrace(input) {
  const { arr, k } = input;
  const n = arr.length;
  const frames = [];
  let g = 0;
  let ops = 0;
  let start = null;
  let cycleIndices = [];
  let cycleValues = [];
  let target = null;
  let cost = 0;
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({
      phase, activeLine, pythonLine, message, arr: [...arr], n, k, g, ops, start,
      cycleIndices: [...cycleIndices], cycleValues: [...cycleValues], target, cost,
    });

  frame("setup", 1, 4, `Array length n = ${n}.`);
  g = gcd(n, k);
  frame("setup", 1, 5, `g = gcd(${n}, ${k}) = ${g}, so there are ${g} cycles of indices.`);
  frame("setup", 2, 6, "No operations have been counted yet.");
  for (let s = 0; s < g; s++) {
    start = s;
    frame("loop", 3, 7, `Cycle start ${s}.`);
    cycleIndices = [];
    for (let i = s; i < n; i += g) cycleIndices.push(i);
    cycleValues = cycleIndices.map((i) => arr[i]).sort((a, b) => a - b);
    frame("gather", 4, 8, `Cycle ${s} holds indices [${cycleIndices.join(", ")}]; sorted values [${cycleValues.join(", ")}].`);
    target = cycleValues[Math.floor(cycleValues.length / 2)];
    frame("median", 5, 9, `The median target for this cycle is ${target}.`);
    cost = cycleValues.reduce((sum, value) => sum + Math.abs(value - target), 0);
    ops += cost;
    frame("add", 6, 10, `This cycle costs ${cost}; running total is ${ops}.`);
  }
  frame("done", 7, 11, `Minimum operations: ${ops}.`);
  return { input, result: ops, frames };
}
