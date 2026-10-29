const PYTHON_LINES = [
  "def invalidTransactions(transactions):",
  "    parsed = []",
  "    for t in transactions:",
  '        name, time, amount, city = t.split(",")',
  "        parsed.append((name, int(time), int(amount), city))",
  "    invalid = set()",
  "    for i, (name, time, amount, city) in enumerate(parsed):",
  "        if amount > 1000:",
  "            invalid.add(i)",
  "        for j, (name2, time2, _, city2) in enumerate(parsed):",
  "            if j != i and name == name2 and city != city2 and abs(time - time2) <= 60:",
  "                invalid.add(i)",
  "                break",
  "    return [transactions[i] for i in sorted(invalid)]",
];

const CODE_LINES = [
  "FUNCTION invalidTransactions(transactions)",
  "  invalid <- empty set of indices",
  "  FOR each index i",
  "    IF amount(i) > 1000 THEN flag i",
  "    FOR each other index j",
  "      IF same name AND different city AND |time(i) - time(j)| <= 60 THEN flag i and stop j-loop",
  "  RETURN transactions whose index is flagged, in order",
];

const MAX_TRANSACTIONS = 50;
const NAME_PATTERN = /^[a-z]{1,10}$/;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// Pseudocode line -> Python line, used for Python playback highlighting.
export const pythonLineMap = { 1: 1, 2: 6, 3: 7, 4: 8, 5: 10, 6: 11, 7: 14 };

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error("Input must be a JSON object such as {\"transactions\": [\"alice,20,800,mtv\"]}");
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a transactions key");
  const { transactions } = obj;
  if (!Array.isArray(transactions)) throw new Error("transactions must be an array of strings");
  if (transactions.length < 1 || transactions.length > MAX_TRANSACTIONS) {
    throw new Error(`transactions must contain between 1 and ${MAX_TRANSACTIONS} entries for this visualization`);
  }
  const parsed = transactions.map((entry, index) => {
    if (typeof entry !== "string") throw new Error(`transactions[${index}] must be a string`);
    const parts = entry.split(",");
    if (parts.length !== 4) throw new Error(`transactions[${index}] must look like name,time,amount,city`);
    const [name, time, amount, city] = parts;
    if (!NAME_PATTERN.test(name)) throw new Error(`transactions[${index}] name must be 1-10 lowercase letters`);
    if (!NAME_PATTERN.test(city)) throw new Error(`transactions[${index}] city must be 1-10 lowercase letters`);
    if (!/^\d+$/.test(time) || Number(time) > 1000) throw new Error(`transactions[${index}] time must be an integer from 0 to 1000`);
    if (!/^\d+$/.test(amount)) throw new Error(`transactions[${index}] amount must be a non-negative integer`);
    return { name, time: Number(time), amount: Number(amount), city };
  });
  return { transactions, parsed };
}

export function buildTrace(input) {
  const { transactions, parsed } = input.parsed ? input : parseInput(input);
  const n = parsed.length;
  const flagged = new Set();
  const frames = [];
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, i: -1, j: -1, flagged: [...flagged].sort((a, b) => a - b), ...extra,
  });

  snap("setup", 2, "Start with no flagged transactions.");
  for (let i = 0; i < n; i++) {
    const a = parsed[i];
    snap("scan", 3, `Check transaction ${i}: ${transactions[i]}.`, { i });
    if (a.amount > 1000) {
      flagged.add(i);
      snap("check", 4, `Amount ${a.amount} is over 1000, so transaction ${i} is flagged.`, { i });
      continue;
    }
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const b = parsed[j];
      const gap = Math.abs(a.time - b.time);
      const matched = a.name === b.name && a.city !== b.city && gap <= 60;
      snap("compare", 6, matched
        ? `Transaction ${j} is ${a.name} in ${b.city} ${gap} minutes away: flag ${i}.`
        : `Transaction ${j} does not conflict with ${i}.`, { i, j, matched });
      if (matched) {
        flagged.add(i);
        break;
      }
    }
  }
  const result = transactions.filter((_, index) => flagged.has(index));
  snap("done", 7, `Return ${result.length} possibly invalid transaction(s).`, { result });
  return { input: transactions, result, frames };
}
