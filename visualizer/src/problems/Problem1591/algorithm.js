export const code = [
  "function isPrintable(targetGrid) {",
  "  const rows = targetGrid.length, cols = targetGrid[0].length;",
  "  const bounds = new Map();",
  "  for (let r = 0; r < rows; r++) {",
  "    for (let c = 0; c < cols; c++) {",
  "      const color = targetGrid[r][c];",
  "      if (!bounds.has(color)) bounds.set(color, [r, r, c, c]);",
  "      else { const box = bounds.get(color); box[0] = Math.min(box[0], r); box[1] = Math.max(box[1], r); box[2] = Math.min(box[2], c); box[3] = Math.max(box[3], c); }",
  "    }",
  "  }",
  "  const graph = new Map([...bounds.keys()].map(color => [color, new Set()]));",
  "  const indeg = new Map([...bounds.keys()].map(color => [color, 0]));",
  "  for (const [color, [r1, r2, c1, c2]] of bounds) {",
  "    for (let r = r1; r <= r2; r++) {",
  "      for (let c = c1; c <= c2; c++) {",
  "        const other = targetGrid[r][c];",
  "        if (other !== color && !graph.get(color).has(other)) {",
  "          graph.get(color).add(other);",
  "          indeg.set(other, indeg.get(other) + 1);",
  "        }",
  "      }",
  "    }",
  "  }",
  "  const queue = [...bounds.keys()].filter(color => indeg.get(color) === 0);",
  "  let removed = 0;",
  "  while (queue.length) {",
  "    const color = queue.pop();",
  "    removed++;",
  "    for (const next of graph.get(color)) {",
  "      indeg.set(next, indeg.get(next) - 1);",
  "      if (indeg.get(next) === 0) queue.push(next);",
  "    }",
  "  }",
  "  return removed === bounds.size;",
  "}",
].map((text, index) => ({ line: index + 1, text }));

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

// JavaScript line -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 10, 9: 14, 10: 14, 11: 15, 12: 16, 13: 17, 14: 18, 15: 19, 16: 20, 17: 21, 18: 22, 19: 23, 20: 23, 21: 23, 22: 23, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 33, 35: 33 };

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
    frames.push({ phase: "bounds", activeLine: 7, message: `Color ${color} occupies rows ${r1}–${r2} and columns ${c1}–${c2}.`, ...base({ current: i }) });
  });

  colors.forEach((color, ci) => {
    const [r1, r2, c1, c2] = boxes.get(color);
    frames.push({ phase: "scan", activeLine: 13, message: `Scan the box of color ${color}.`, ...base({ current: ci }) });
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const other = targetGrid[r][c];
        if (other === color) continue;
        const oi = index.get(other), key = `${ci},${oi}`;
        if (edgeKeys.has(key)) {
          frames.push({ phase: "scan", activeLine: 17, message: `Cell (${r}, ${c}) holds ${other}; edge ${color} → ${other} is already recorded.`, ...base({ current: ci, neighbour: oi }) });
        } else {
          edgeKeys.add(key);
          edges.push([ci, oi]);
          indeg[oi] += 1;
          frames.push({ phase: "edge", activeLine: 19, message: `Cell (${r}, ${c}) holds ${other} inside ${color}'s box, so ${color} must be painted before ${other}.`, ...base({ current: ci, neighbour: oi }) });
        }
      }
    }
  });

  const queue = colors.map((_, i) => i).filter(i => indeg[i] === 0);
  frames.push({ phase: "order", activeLine: 24, message: "Colors with no incoming edge can be painted first.", ...base({ queue: queue.slice() }) });
  let removed = 0;
  const done = [];
  while (queue.length) {
    const ci = queue.pop();
    removed++;
    done.push(ci);
    frames.push({ phase: "order", activeLine: 27, message: `Pop color ${colors[ci]}; removed = ${removed}.`, ...base({ current: ci, queue: queue.slice(), done: done.slice() }) });
    for (const [a, b] of edges) {
      if (a !== ci) continue;
      indeg[b] -= 1;
      if (indeg[b] === 0) queue.push(b);
      frames.push({ phase: "order", activeLine: 30, message: `Remove edge ${colors[a]} → ${colors[b]}; indegree of ${colors[b]} is ${indeg[b]}.`, ...base({ current: ci, neighbour: b, queue: queue.slice(), done: done.slice() }) });
    }
  }
  const result = removed === colors.length;
  frames.push({ phase: "done", activeLine: 34, message: result ? "Every color was removed, so the order is acyclic: the grid is printable." : "Some colors remain on a cycle: the grid is not printable.", ...base({ queue: [], done: done.slice() }) });
  return { input: { targetGrid }, colors, result, frames };
}
