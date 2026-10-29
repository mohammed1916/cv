const MOD = 1000000007n;

const PYTHON_LINES = [
  "def maximumScore(nums, k):",
  "    def prime_score(x):",
  "        count = 0",
  "        d = 2",
  "        while d * d <= x:",
  "            if x % d == 0:",
  "                count += 1",
  "                while x % d == 0:",
  "                    x //= d",
  "            d += 1",
  "        if x > 1:",
  "            count += 1",
  "        return count",
  "    MOD = 10**9 + 7",
  "    n = len(nums)",
  "    scores = [prime_score(v) for v in nums]",
  "    left = [0] * n",
  "    stack = []",
  "    for i in range(n):",
  "        while stack and scores[stack[-1]] < scores[i]:",
  "            stack.pop()",
  "        left[i] = stack[-1] if stack else -1",
  "        stack.append(i)",
  "    right = [0] * n",
  "    stack = []",
  "    for i in range(n - 1, -1, -1):",
  "        while stack and scores[stack[-1]] <= scores[i]:",
  "            stack.pop()",
  "        right[i] = stack[-1] if stack else n",
  "        stack.append(i)",
  "    order = sorted(range(n), key=lambda i: -nums[i])",
  "    score = 1",
  "    for i in order:",
  "        if k == 0:",
  "            break",
  "        count = (i - left[i]) * (right[i] - i)",
  "        use = min(count, k)",
  "        score = score * pow(nums[i], use, MOD) % MOD",
  "        k -= use",
  "    return score",
];

const CODE_LINES = [
  "MOD <- 1000000007",
  "n <- length of nums",
  "scores[i] <- number of distinct prime factors of nums[i]",
  "left[i] <- nearest index to the left with score >= scores[i], or -1",
  "right[i] <- nearest index to the right with score > scores[i], or n",
  "count[i] <- (i - left[i]) * (right[i] - i) subarrays where i wins",
  "order <- indices sorted by nums value, largest first",
  "score <- 1",
  "for i in order while k > 0",
  "  use <- min(count[i], k)",
  "  score <- score * nums[i]^use mod MOD",
  "  k <- k - use",
  "return score",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

export function primeScore(x) {
  let count = 0;
  let value = x;
  for (let d = 2; d * d <= value; d += 1) {
    if (value % d === 0) {
      count += 1;
      while (value % d === 0) value /= d;
    }
  }
  if (value > 1) count += 1;
  return count;
}

function modPow(base, exp) {
  let result = 1n;
  let b = BigInt(base) % MOD;
  let e = BigInt(exp);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD;
    b = (b * b) % MOD;
    e >>= 1n;
  }
  return result;
}

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with nums and k.");
  const { nums, k } = input;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers.");
  if (nums.length < 1 || nums.length > 50) throw new Error(`nums length must be between 1 and 50 for this visualization (got ${nums.length}).`);
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100000)) throw new Error("Every nums[i] must be an integer from 1 to 100000.");
  const n = nums.length;
  const maxK = Math.min((n * (n + 1)) / 2, 1e9);
  if (!Number.isInteger(k) || k < 1 || k > maxK) throw new Error(`k must be an integer from 1 to ${maxK}.`);
  return { nums, k };
}

export function buildTrace(input) {
  const { nums, k: startK } = parseInput(input);
  const n = nums.length;
  const frames = [];
  const roles = () => Array(n).fill("");
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: nums, active: -1, roles: roles(), detail: "", ...extra,
  });

  push("setup", 2, py("n = len(nums)"), `n = ${n}. Prime score = number of distinct prime factors.`);
  const scores = nums.map(primeScore);
  push("score", 3, py("scores = [prime_score(v) for v in nums]"), "Prime score of every element.", { detail: `scores = [${scores.join(", ")}]` });

  const left = Array(n).fill(0);
  const right = Array(n).fill(0);
  let stack = [];
  for (let i = 0; i < n; i += 1) {
    while (stack.length && scores[stack[stack.length - 1]] < scores[i]) stack.pop();
    left[i] = stack.length ? stack[stack.length - 1] : -1;
    const r = roles(); r[i] = "current"; if (left[i] >= 0) r[left[i]] = "bound";
    push("left", 4, py("left[i] = stack[-1] if stack else -1"),
      `Nearest index to the left with score >= ${scores[i]} is ${left[i]}.`, { active: i, roles: r, detail: `left[${i}] = ${left[i]}` });
    stack.push(i);
  }
  stack = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    while (stack.length && scores[stack[stack.length - 1]] <= scores[i]) stack.pop();
    right[i] = stack.length ? stack[stack.length - 1] : n;
    const r = roles(); r[i] = "current"; if (right[i] < n) r[right[i]] = "bound";
    push("right", 5, py("right[i] = stack[-1] if stack else n"),
      `Nearest index to the right with score > ${scores[i]} is ${right[i] < n ? right[i] : "none (n)"}.`, { active: i, roles: r, detail: `right[${i}] = ${right[i]}` });
    stack.push(i);
  }

  const count = nums.map((_, i) => (i - left[i]) * (right[i] - i));
  const order = nums.map((_, i) => i).sort((a, b) => nums[b] - nums[a] || a - b);
  let k = startK;
  let score = 1n;
  push("order", 7, py("order = sorted(range(n), key=lambda i: -nums[i])"), "Consider elements from the largest value down.", { detail: `order = [${order.join(", ")}]` });
  push("score", 8, py("score = 1"), "Start with score 1.", { detail: "score = 1" });
  for (const i of order) {
    const r = roles(); r[i] = "current";
    push("pick", 9, py("for i in order:"), `Element ${i} (value ${nums[i]}) is next.`, { active: i, roles: r });
    if (k === 0) {
      push("pick", 9, py("if k == 0:"), "No operations left.", { active: i, roles: r });
      break;
    }
    push("pick", 9, py("if k == 0:"), `Operations left: ${k}.`, { active: i, roles: r });
    const useRoles = roles(); useRoles[i] = "current";
    push("pick", 6, py("count = (i - left[i]) * (right[i] - i)"), `Element ${i} wins ${count[i]} subarrays.`, { active: i, roles: useRoles, detail: `count = ${count[i]}` });
    const use = Math.min(count[i], k);
    push("pick", 10, py("use = min(count, k)"), `Use it ${use} time(s): min(${count[i]} subarrays, ${k} operations left).`, { active: i, roles: useRoles, detail: `use = ${use}` });
    score = (score * modPow(nums[i], use)) % MOD;
    push("pick", 11, py("score = score * pow(nums[i], use, MOD) % MOD"), `Score is now ${score}.`, { active: i, roles: useRoles, detail: `score = ${score}` });
    k -= use;
    push("pick", 12, py("k -= use"), `${k} operation(s) left.`, { active: i, roles: useRoles, detail: `k = ${k}` });
  }
  push("result", 13, py("return score"), `Maximum score ${score} mod 1000000007.`, { detail: `return ${score}` });
  return { input: { nums, k: startK }, result: Number(score), frames };
}
