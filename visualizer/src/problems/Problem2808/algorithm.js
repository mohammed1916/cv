const PYTHON_LINES = [
  "def minimumSeconds(nums):",
  "    n = len(nums)",
  "    positions = {}",
  "    for i, value in enumerate(nums):",
  "        positions.setdefault(value, []).append(i)",
  "    answer = n",
  "    for value, idx in positions.items():",
  "        worst = 0",
  "        for k in range(len(idx)):",
  "            start = idx[k]",
  "            end = idx[(k + 1) % len(idx)]",
  "            steps = (end - start) % n or n",
  "            worst = max(worst, steps // 2)",
  "        answer = min(answer, worst)",
  "    return answer",
];

const CODE_LINES = [
  "n <- length of nums",
  "positions <- empty map from value to index list",
  "for each index i, append i to positions[nums[i]]",
  "answer <- n",
  "for each value with index list idx",
  "  worst <- 0",
  "  for k from 0 to len(idx) - 1",
  "    steps <- cyclic distance from idx[k] to the next index",
  "    worst <- max(worst, steps // 2)",
  "  answer <- min(answer, worst)",
  "return answer",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// 1-based Python line number for an exact (trimmed) source line.
const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with a nums array.");
  const { nums } = input;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers.");
  if (nums.length < 1 || nums.length > 50) throw new Error(`nums length must be between 1 and 50 for this visualization (got ${nums.length}).`);
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1e9)) throw new Error("Every nums[i] must be an integer from 1 to 1000000000.");
  return { nums };
}

export function buildTrace(input) {
  const { nums } = parseInput(input);
  const n = nums.length;
  const frames = [];
  const positions = new Map();
  const roles = () => Array(n).fill("");
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: nums, active: -1, roles: roles(), detail: "", ...extra,
  });

  push("setup", 1, py("n = len(nums)"), `n = ${n}; the array is circular, so index n-1 neighbours index 0.`);
  push("setup", 2, py("positions = {}"), "Create an empty map from each value to the indices holding it.");
  nums.forEach((value, i) => {
    if (!positions.has(value)) positions.set(value, []);
    positions.get(value).push(i);
    const r = roles();
    r[i] = "group";
    push("group", 3, py("positions.setdefault(value, []).append(i)"),
      `Index ${i} holds ${value}; add it to positions[${value}].`,
      { active: i, roles: r, detail: `positions[${value}] = [${positions.get(value).join(", ")}]` });
  });

  let answer = n;
  push("answer", 4, py("answer = n"), `Start with answer = ${n}, an upper bound.`, { detail: `answer = ${answer}` });

  for (const [value, idx] of positions) {
    const groupRoles = roles();
    idx.forEach(i => { groupRoles[i] = "group"; });
    push("group", 5, py("for value, idx in positions.items():"),
      `Consider value ${value} with indices [${idx.join(", ")}].`, { active: idx[0], roles: groupRoles });
    let worst = 0;
    push("gap", 6, py("worst = 0"), `worst starts at 0 for value ${value}.`, { active: idx[0], roles: groupRoles, detail: "worst = 0" });
    push("gap", 7, py("for k in range(len(idx)):"), `Walk each cyclic gap between consecutive occurrences of ${value}.`, { active: idx[0], roles: groupRoles });
    idx.forEach((start, k) => {
      const next = idx[(k + 1) % idx.length];
      const steps = (next - start + n) % n || n;
      const r = roles();
      idx.forEach(i => { r[i] = "group"; });
      r[start] = "from";
      r[next] = "to";
      push("gap", 8, py("start = idx[k]"), `Gap from index ${start} to index ${next} (cyclic).`, { active: start, roles: r });
      push("gap", 8, py("end = idx[(k + 1) % len(idx)]"), `The next occurrence after ${start} is index ${next}.`, { active: next, roles: r });
      push("gap", 8, py("steps = (end - start) % n or n"),
        `Distance ${steps} steps; a gap of ${steps - 1} other cells is filled in ${Math.floor(steps / 2)} seconds from both ends.`,
        { active: next, roles: r, detail: `steps = ${steps}` });
      worst = Math.max(worst, Math.floor(steps / 2));
      push("gap", 9, py("worst = max(worst, steps // 2)"), `worst becomes ${worst}.`, { active: next, roles: r, detail: `worst = ${worst}` });
    });
    answer = Math.min(answer, worst);
    push("answer", 10, py("answer = min(answer, worst)"), `Value ${value} needs ${worst} seconds; answer is now ${answer}.`,
      { active: idx[0], roles: groupRoles, detail: `answer = ${answer}` });
  }

  push("result", 11, py("return answer"), `Minimum seconds: ${answer}.`, { detail: `return ${answer}` });
  return { input: { nums }, result: answer, frames };
}
