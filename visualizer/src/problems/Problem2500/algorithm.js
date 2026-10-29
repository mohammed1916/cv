const PYTHON_LINES = [
  "import heapq",
  "",
  "def deleteGreatestValue(grid):",
  "    heaps = []",
  "    for row in grid:",
  "        h = [-x for x in row]",
  "        heapq.heapify(h)",
  "        heaps.append(h)",
  "    total = 0",
  "    for _ in range(len(grid[0])):",
  "        best = 0",
  "        for h in heaps:",
  "            best = max(best, -heapq.heappop(h))",
  "        total += best",
  "    return total",
];

const CODE_LINES = [
  "FUNCTION deleteGreatestValue(grid)",
  "  FOR each row, build a max-heap of its values",
  "  total <- 0",
  "  REPEAT once for each column",
  "    best <- 0",
  "    FOR each row, remove its greatest value and keep the largest removed",
  "    add best to total",
  "  RETURN total",
];

const MAX_SIZE = 10;
const MAX_VALUE = 100;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"grid": [[1,2,4],[3,3,1]]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a grid key");
  const { grid } = obj;
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have between 1 and ${MAX_SIZE} rows for this visualization`);
  const width = Array.isArray(grid[0]) ? grid[0].length : 0;
  if (width < 1 || width > MAX_SIZE) throw new Error(`each row must have between 1 and ${MAX_SIZE} values for this visualization`);
  grid.forEach((row, r) => {
    if (!Array.isArray(row) || row.length !== width) throw new Error(`grid[${r}] must be an array with ${width} values`);
    row.forEach((value, c) => {
      if (!Number.isInteger(value) || value < 1 || value > MAX_VALUE) throw new Error(`grid[${r}][${c}] must be an integer from 1 to ${MAX_VALUE}`);
    });
  });
  return { grid };
}

// Max-heap helpers mirror heapq on negated values, so the Python heaps hold the same numbers.
function heapPush(h, x) {
  h.push(x);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p] >= h[i]) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}

function heapPop(h) {
  const top = h[0];
  const last = h.pop();
  if (h.length) {
    h[0] = last;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < h.length && h[l] > h[m]) m = l;
      if (r < h.length && h[r] > h[m]) m = r;
      if (m === i) break;
      [h[m], h[i]] = [h[i], h[m]];
      i = m;
    }
  }
  return top;
}

export function buildTrace(input) {
  const { grid } = input.grid ? input : parseInput(input);
  const heaps = [];
  const frames = [];
  let total = 0;
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, row: -1, heap0: heaps[0] ? [...heaps[0]] : [], total, best: null, ...extra,
  });

  snap("setup", 2, "heaps = []", "Start with no row heaps.");
  for (let r = 0; r < grid.length; r++) {
    snap("build", 2, "for row in grid", `Build the max-heap for row ${r}.`, { row: r });
    const h = [];
    for (const x of grid[r]) heapPush(h, x);
    heaps.push(h);
    snap("heapify", 2, "heapq.heapify", `Row ${r} is now a max-heap.`, { row: r, heap0: [...heaps[0]] });
  }

  snap("total", 3, "total = 0", "The running total starts at 0.", { heap0: [...heaps[0]] });
  for (let c = 0; c < grid[0].length; c++) {
    snap("round", 4, "for _ in range", `Round ${c + 1}: remove one greatest value from each row.`, { round: c + 1 });
    let best = 0;
    snap("reset", 5, "best = 0", "Start the best removed value for this round at 0.", { round: c + 1, best });
    for (let r = 0; r < heaps.length; r++) {
      snap("pick", 6, "for h in heaps", `Take the greatest value left in row ${r}.`, { round: c + 1, row: r, best });
      const popped = heapPop(heaps[r]);
      best = Math.max(best, popped);
      snap("pop", 6, "best = max(best", `Row ${r} gives up ${popped}; the largest so far is ${best}.`, { round: c + 1, row: r, best, heap0: [...heaps[0]] });
    }
    total += best;
    snap("add", 7, "total += best", `Add ${best} to the total, now ${total}.`, { round: c + 1, best, total });
  }
  snap("done", 8, "return total", `Return ${total}.`, { result: total, total });
  return { input: { grid }, result: total, frames };
}
