const PYTHON_LINES = [
  "def getMaxFunctionValue(receiver, k):",
  "    n = len(receiver)",
  "    LOG = k.bit_length()",
  "    nxt = [receiver[:]]",
  "    sums = [receiver[:]]",
  "    for j in range(1, LOG):",
  "        prev_nxt = nxt[j - 1]",
  "        prev_sum = sums[j - 1]",
  "        nxt.append([prev_nxt[prev_nxt[i]] for i in range(n)])",
  "        sums.append([prev_sum[i] + prev_sum[prev_nxt[i]] for i in range(n)])",
  "    best = 0",
  "    for x in range(n):",
  "        cur = x",
  "        total = x",
  "        for j in range(LOG):",
  "            if (k >> j) & 1:",
  "                total += sums[j][cur]",
  "                cur = nxt[j][cur]",
  "        best = max(best, total)",
  "    return best",
];

const CODE_LINES = [
  "n <- length of receiver",
  "LOG <- bit length of k",
  "nxt[0] <- receiver, sums[0] <- receiver",
  "for each level j from 1 to LOG - 1",
  "  nxt[j][i] <- nxt[j-1][ nxt[j-1][i] ] for every i",
  "  sums[j][i] <- sums[j-1][i] + sums[j-1][ nxt[j-1][i] ] for every i",
  "best <- 0",
  "for each start x",
  "  cur <- x, total <- x",
  "  for each bit j of k, lowest first",
  "    if bit j of k is set: total <- total + sums[j][cur]",
  "      cur <- nxt[j][cur]",
  "  best <- max(best, total)",
  "return best",
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
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with receiver and k.");
  const { receiver, k } = input;
  if (!Array.isArray(receiver)) throw new Error("receiver must be an array of integers.");
  const n = receiver.length;
  if (n < 1 || n > 24) throw new Error(`receiver length must be between 1 and 24 for this visualization (got ${n}).`);
  if (!receiver.every(v => Number.isInteger(v) && v >= 0 && v <= n - 1)) throw new Error(`Every receiver[i] must be an integer from 0 to ${n - 1}.`);
  if (!Number.isInteger(k) || k < 1 || k > 1e10) throw new Error("k must be an integer from 1 to 10000000000.");
  return { receiver, k };
}

export function buildTrace(input) {
  const { receiver, k } = parseInput(input);
  const n = receiver.length;
  const edges = receiver.map((to, from) => [from, to]);
  const frames = [];
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, n, edges, directed: true, current: null, visited: [], done: [], tags: {}, notes: [], detail: "", ...extra,
  });

  push("setup", 1, py("n = len(receiver)"), `${n} players; each passes to receiver[i].`, { detail: `n = ${n}` });
  const LOG = k.toString(2).length;
  push("setup", 2, py("LOG = k.bit_length()"), `k = ${k} has ${LOG} binary digits, so LOG = ${LOG}.`, { detail: `LOG = ${LOG}` });

  const nxt = [receiver.slice()];
  const sums = [receiver.slice()];
  push("table", 3, py("nxt = [receiver[:]]"), "Level 0: one pass goes to receiver[i]; the sum is the receiver index.", { tags: Object.fromEntries(receiver.map((r, i) => [i, `→${r}`])), detail: "nxt[0] = receiver" });
  for (let j = 1; j < LOG; j += 1) {
    push("table", 4, py("for j in range(1, LOG):"), `Build level ${j}: 2^${j} passes per entry.`, { detail: `level ${j}` });
    const prevNxt = nxt[j - 1];
    const prevSum = sums[j - 1];
    nxt.push(prevNxt.map((_, i) => prevNxt[prevNxt[i]]));
    push("table", 5, py("nxt.append([prev_nxt[prev_nxt[i]] for i in range(n)])"),
      `nxt[${j}] jumps 2^${j} passes.`, { tags: Object.fromEntries(nxt[j].map((r, i) => [i, `${2 ** j}→${r}`])), detail: `nxt[${j}] built` });
    sums.push(prevSum.map((_, i) => prevSum[i] + prevSum[prevNxt[i]]));
    push("table", 6, py("sums.append([prev_sum[i] + prev_sum[prev_nxt[i]] for i in range(n)])"),
      `sums[${j}] adds the receiver indices visited in those 2^${j} passes.`, { tags: Object.fromEntries(sums[j].map((s, i) => [i, `Σ${s}`])), detail: `sums[${j}] built` });
  }

  let best = 0;
  push("search", 7, py("best = 0"), "Best total starts at 0.", { detail: "best = 0" });
  for (let x = 0; x < n; x += 1) {
    push("search", 8, py("for x in range(n):"), `Start the ball at player ${x}.`, { current: x, visited: [x] });
    let cur = x;
    let total = x;
    push("search", 9, py("cur = x"), `Current holder is ${cur}.`, { current: cur, visited: [x], tags: { [x]: `total ${total}` } });
    push("search", 9, py("total = x"), `Total starts with ${total} (the start player).`, { current: cur, visited: [x], tags: { [x]: `total ${total}` } });
    const path = [x];
    for (let j = 0; j < LOG; j += 1) {
      push("search", 10, py("for j in range(LOG):"), `Consider bit ${j} of k.`, { current: cur, visited: path.slice(), tags: { [x]: `total ${total}` } });
      if (((k >> j) & 1) === 1) {
        push("search", 11, py("if (k >> j) & 1:"), `Bit ${j} is set: take a block of 2^${j} passes from player ${cur}.`, { current: cur, visited: path.slice(), tags: { [x]: `total ${total}` } });
        const gain = sums[j][cur];
        total += gain;
        push("search", 11, py("total += sums[j][cur]"), `Add ${gain} from that block; total is now ${total}.`, { current: cur, visited: path.slice(), tags: { [x]: `total ${total}` }, detail: `total = ${total}` });
        cur = nxt[j][cur];
        path.push(cur);
        push("search", 12, py("cur = nxt[j][cur]"), `Ball is now with player ${cur}.`, { current: cur, visited: path.slice(), tags: { [x]: `total ${total}` }, detail: `cur = ${cur}` });
      }
    }
    best = Math.max(best, total);
    push("search", 13, py("best = max(best, total)"), `Start ${x} gives ${total}; best is ${best}.`, { current: x, visited: path.slice(), done: [x], tags: { [x]: `total ${total}` }, detail: `best = ${best}` });
  }
  push("result", 14, py("return best"), `Maximum function value ${best}.`, { detail: `return ${best}` });
  return { input: { receiver, k }, result: best, frames };
}
