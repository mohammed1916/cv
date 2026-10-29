export const CODE = [
  "FUNCTION isPrintable(targetGrid)",
  "    FOR every color, find its bounding box",
  "    graph ← empty edge set; indegree[color] ← 0 for every color",
  "    FOR each color c, FOR each cell in its box with color d ≠ c",
  "        IF edge c → d is new: add it and increase indegree[d]",
  "    queue ← colors with indegree 0; removed ← 0",
  "    WHILE queue is not empty",
  "        pop color c; removed ← removed + 1",
  "        FOR each edge c → d: decrease indegree[d]; push d when it reaches 0",
  "    RETURN removed = number of colors",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const python = `def isPrintable(targetGrid):
    rows, cols = len(targetGrid), len(targetGrid[0])
    bounds = {}
    for r in range(rows):
        for c in range(cols):
            color = targetGrid[r][c]
            if color not in bounds:
                bounds[color] = [r, r, c, c]
            else:
                box = bounds[color]
                box[0] = min(box[0], r)
                box[1] = max(box[1], r)
                box[2] = min(box[2], c)
                box[3] = max(box[3], c)
    graph = {color: set() for color in bounds}
    indeg = {color: 0 for color in bounds}
    for color, (r1, r2, c1, c2) in bounds.items():
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                other = targetGrid[r][c]
                if other != color and other not in graph[color]:
                    graph[color].add(other)
                    indeg[other] += 1
    queue = [color for color in bounds if indeg[color] == 0]
    removed = 0
    while queue:
        color = queue.pop()
        removed += 1
        for nxt in graph[color]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return removed == len(bounds)`;

// Pseudocode activeLine -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 4, 3: 15, 4: 17, 5: 22, 6: 24, 7: 26, 8: 27, 9: 29, 10: 33 };

const MAX_SIDE = 12;
const MAX_COLORS = 24;

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try { data = JSON.parse(text); } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`); }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "targetGrid".');
  const grid = data.targetGrid;
  if (!Array.isArray(grid) || grid.length === 0 || !Array.isArray(grid[0]) || grid[0].length === 0) {
    throw new Error("targetGrid must be a non-empty 2D array.");
  }
  const cols = grid[0].length;
  if (grid.some(row => !Array.isArray(row) || row.length !== cols)) throw new Error("targetGrid must be rectangular.");
  if (grid.some(row => row.some(color => !Number.isInteger(color) || color < 1 || color > 60))) {
    throw new Error("Every color must be an integer from 1 to 60.");
  }
  if (grid.length > MAX_SIDE || cols > MAX_SIDE) throw new Error(`targetGrid is limited to ${MAX_SIDE} x ${MAX_SIDE} in this visualization (LeetCode allows 60 x 60).`);
  const colors = new Set(grid.flat());
  if (colors.size > MAX_COLORS) throw new Error(`At most ${MAX_COLORS} distinct colors are supported in this visualization.`);
  return { targetGrid: grid };
}

export function buildTrace({ targetGrid }) {
  const rows = targetGrid.length, cols = targetGrid[0].length;
  const colors = [...new Set(targetGrid.flat())].sort((a, b) => a - b);
  const index = new Map(colors.map((color, i) => [color, i]));
  const boxes = new Map();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = targetGrid[r][c];
      if (!boxes.has(color)) boxes.set(color, [r, r, c, c]);
      else {
        const box = boxes.get(color);
        box[0] = Math.min(box[0], r); box[1] = Math.max(box[1], r);
        box[2] = Math.min(box[2], c); box[3] = Math.max(box[3], c);
      }
    }
  }
  const frames = [];
  const edges = [];
  const edgeKeys = new Set();
  const indeg = colors.map(() => 0);
  const tags = () => Object.fromEntries(colors.map((color, i) => [i, `in ${indeg[i]}`]));
  const base = extra => ({ edges: edges.map(e => e.slice()), tags: tags(), current: null, neighbour: null, queue: [], done: [], ...extra });

  colors.forEach((color, i) => {
    const [r1, r2, c1, c2] = boxes.get(color);
    frames.push({ phase: "bounds", activeLine: 2, message: `Color ${color} occupies rows ${r1}–${r2} and columns ${c1}–${c2}.`, ...base({ current: i }) });
  });

  colors.forEach((color, ci) => {
    const [r1, r2, c1, c2] = boxes.get(color);
    frames.push({ phase: "scan", activeLine: 4, message: `Scan the box of color ${color}.`, ...base({ current: ci }) });
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const other = targetGrid[r][c];
        if (other === color) continue;
        const oi = index.get(other), key = `${ci},${oi}`;
        if (edgeKeys.has(key)) {
          frames.push({ phase: "scan", activeLine: 4, message: `Cell (${r}, ${c}) holds ${other}; edge ${color} → ${other} is already recorded.`, ...base({ current: ci, neighbour: oi }) });
        } else {
          edgeKeys.add(key);
          edges.push([ci, oi]);
          indeg[oi] += 1;
          frames.push({ phase: "edge", activeLine: 5, message: `Cell (${r}, ${c}) holds ${other} inside ${color}'s box, so ${color} must be painted before ${other}.`, ...base({ current: ci, neighbour: oi }) });
        }
      }
    }
  });

  const queue = colors.map((_, i) => i).filter(i => indeg[i] === 0);
  frames.push({ phase: "order", activeLine: 6, message: "Colors with no incoming edge can be painted first.", ...base({ queue: queue.slice() }) });
  let removed = 0;
  const done = [];
  while (queue.length) {
    const ci = queue.pop();
    removed++;
    done.push(ci);
    frames.push({ phase: "order", activeLine: 8, message: `Pop color ${colors[ci]}; removed = ${removed}.`, ...base({ current: ci, queue: queue.slice(), done: done.slice() }) });
    for (const [a, b] of edges) {
      if (a !== ci) continue;
      indeg[b] -= 1;
      if (indeg[b] === 0) queue.push(b);
      frames.push({ phase: "order", activeLine: 9, message: `Remove edge ${colors[a]} → ${colors[b]}; indegree of ${colors[b]} is ${indeg[b]}.`, ...base({ current: ci, neighbour: b, queue: queue.slice(), done: done.slice() }) });
    }
  }
  const result = removed === colors.length;
  frames.push({ phase: "done", activeLine: 10, message: result ? "Every color was removed, so the order is acyclic: the grid is printable." : "Some colors remain on a cycle: the grid is not printable.", ...base({ queue: [], done: done.slice() }) });
  return { input: { targetGrid }, colors, result, frames };
}
