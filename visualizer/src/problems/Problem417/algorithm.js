// LeetCode 417: Pacific Atlantic Water Flow.
// Water flows from a cell to any neighbour that is equal or lower. We reverse that:
// each ocean floods uphill from its border, moving to neighbours that are equal or higher.
// A cell is in the answer when both oceans reach it.

const MAX_VISUAL_SIZE = 20;

const CODE_LINES = {
  1: "FUNCTION pacificAtlantic(heights)",
  2: "    rows, cols ← size of heights",
  3: "    pacific ← flood from top row and left column",
  4: "    atlantic ← flood from bottom row and right column",
  5: "    RETURN cells that are in both pacific and atlantic",
  6: "FUNCTION flood(starts)",
  7: "    reached ← starts; queue ← starts",
  8: "    WHILE queue is not empty",
  9: "        (r, c) ← pop the front of queue",
  10: "        FOR each neighbour (nr, nc) of (r, c)",
  11: "            IF (nr, nc) is in bounds, not reached, and heights[nr][nc] ≥ heights[r][c]",
  12: "                add (nr, nc) to reached and queue",
  13: "    RETURN reached",
};

const PYTHON_LINES = [
  "from collections import deque",                                       // 1
  "class Solution:",                                                     // 2
  "    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:", // 3
  "        if not heights or not heights[0]:",                            // 4
  "            return []",                                                // 5
  "        rows, cols = len(heights), len(heights[0])",                   // 6
  "        def flood(starts):",                                           // 7
  "            reached = set(starts)",                                    // 8
  "            queue = deque(starts)",                                    // 9
  "            while queue:",                                             // 10
  "                r, c = queue.popleft()",                               // 11
  "                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",   // 12
  "                    nr, nc = r + dr, c + dc",                          // 13
  "                    if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in reached",  // 14
  "                            and heights[nr][nc] >= heights[r][c]):",   // 15
  "                        reached.add((nr, nc))",                        // 16
  "                        queue.append((nr, nc))",                       // 17
  "            return reached",                                           // 18
  "        pacific = flood(list(dict.fromkeys([(r, 0) for r in range(rows)] + [(0, c) for c in range(cols)])))", // 19
  "        atlantic = flood(list(dict.fromkeys([(r, cols - 1) for r in range(rows)] + [(rows - 1, c) for c in range(cols)])))", // 20
  "        return [[r, c] for r, c in sorted(pacific & atlantic)]",      // 21
  "",
  "if __name__ == \"__main__\":",
  "    import sys, json",
  "    print(json.dumps(Solution().pacificAtlantic(json.loads(sys.stdin.read()))))",
];

const PYTHON_SOURCE = PYTHON_LINES.join("\n");

const PHASES = [
  { id: "setup", label: "Read grid", description: "Measure the grid and name the two oceans." },
  { id: "pacific", label: "Pacific wave", description: "Flood uphill from the top and left edges." },
  { id: "atlantic", label: "Atlantic wave", description: "Flood uphill from the bottom and right edges." },
  { id: "compare", label: "Intersect", description: "Keep cells that both waves reached." },
  { id: "done", label: "Answer", description: "Report every cell that drains to both oceans." },
];

// Pseudocode activeLine -> Python line, used when a frame does not set its own pythonLine.
const pythonLineMap = {
  1: 3,
  2: 6,
  3: 19,
  4: 20,
  5: 21,
  7: 8,
  9: 11,
  11: 14,
  12: 16,
  13: 18,
};

export const code = Object.keys(CODE_LINES).map(Number).map((line) => ({ line, text: CODE_LINES[line] }));
export const python = PYTHON_SOURCE;
export const phases = PHASES;

// Throws when a frame names a line that has no text, so a broken trace cannot render silently.
export function codeText(line) {
  const text = CODE_LINES[line];
  if (text === undefined) throw new Error(`Missing pseudocode line ${line}`);
  return text;
}

export function pythonText(line) {
  if (!Number.isInteger(line) || line < 1 || line > PYTHON_LINES.length) {
    throw new Error(`Missing Python line ${line}`);
  }
  return PYTHON_LINES[line - 1];
}

export { pythonLineMap };

export function parseInput(input) {
  let heights = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new Error("Enter a heights matrix such as [[1,2],[4,3]].");
    try {
      heights = JSON.parse(text);
    } catch {
      throw new Error("Heights must be a JSON array of arrays, e.g. [[1,2],[4,3]].");
    }
  }
  if (!Array.isArray(heights) || heights.length === 0) {
    throw new Error("Heights must have at least one row.");
  }
  if (heights.length > MAX_VISUAL_SIZE) {
    throw new Error(`The visual supports up to ${MAX_VISUAL_SIZE} rows (received ${heights.length}).`);
  }
  const cols = Array.isArray(heights[0]) ? heights[0].length : 0;
  if (cols === 0) throw new Error("Each row must contain at least one height.");
  if (cols > MAX_VISUAL_SIZE) {
    throw new Error(`The visual supports up to ${MAX_VISUAL_SIZE} columns (received ${cols}).`);
  }
  heights.forEach((row, r) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error(`Row ${r} must have ${cols} heights so the grid is rectangular.`);
    }
    row.forEach((value, c) => {
      if (!Number.isInteger(value)) throw new Error(`Height at (${r}, ${c}) must be an integer.`);
    });
  });
  return heights.map((row) => row.slice());
}

const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (r, c) => `${r},${c}`;

function sortedCells(set) {
  return [...set].map((text) => text.split(",").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// Builds the full trace. Every frame carries phase, activeLine, pythonLine, message and a reach snapshot.
export function buildTrace(input) {
  const heights = parseInput(input);
  const rows = heights.length;
  const cols = heights[0].length;
  const reach = { pacific: new Set(), atlantic: new Set() };
  const frames = [];

  function emit(phase, activeLine, pythonLine, message, extra = {}) {
    codeText(activeLine);
    pythonText(pythonLine);
    frames.push({
      phase,
      activeLine,
      pythonLine,
      message,
      reach: {
        pacific: sortedCells(reach.pacific),
        atlantic: sortedCells(reach.atlantic),
        frontier: extra.frontier ? extra.frontier.map(([r, c]) => [r, c]) : [],
        current: extra.current ?? null,
        neighbour: extra.neighbour ?? null,
        ocean: extra.ocean ?? null,
        verdict: extra.verdict ?? null,
        answer: extra.answer ?? null,
      },
    });
  }

  function flood(name, starts, seedLine, seedPython) {
    const set = reach[name];
    starts.forEach(([r, c]) => set.add(key(r, c)));
    const queue = starts.map(([r, c]) => [r, c]);
    emit(name, seedLine, seedPython,
      `${name === "pacific" ? "Pacific" : "Atlantic"} wave starts on ${starts.length} border cell${starts.length === 1 ? "" : "s"}.`,
      { ocean: name, frontier: queue });
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      emit(name, 9, 11, `Pop (${r}, ${c}) at height ${heights[r][c]}; the wave now checks its neighbours.`,
        { ocean: name, frontier: queue, current: [r, c] });
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        let verdict;
        let message;
        if (set.has(key(nr, nc))) {
          verdict = "visited";
          message = `(${nr}, ${nc}) is already in the ${name} wave.`;
        } else if (heights[nr][nc] < heights[r][c]) {
          verdict = "lower";
          message = `(${nr}, ${nc}) is height ${heights[nr][nc]}, lower than ${heights[r][c]}: water cannot climb down to it from here.`;
        } else {
          verdict = "accepted";
          set.add(key(nr, nc));
          queue.push([nr, nc]);
          message = `(${nr}, ${nc}) is height ${heights[nr][nc]}, at least ${heights[r][c]}: the ${name} wave reaches it.`;
        }
        emit(name, verdict === "accepted" ? 12 : 11, verdict === "accepted" ? 16 : 14, message,
          { ocean: name, frontier: queue, current: [r, c], neighbour: [nr, nc], verdict });
      }
    }
    emit(name, 13, 18, `${name === "pacific" ? "Pacific" : "Atlantic"} wave finished with ${set.size} reachable cells.`,
      { ocean: name, frontier: [] });
  }

  const pacificStarts = [];
  for (let r = 0; r < rows; r += 1) pacificStarts.push([r, 0]);
  for (let c = 1; c < cols; c += 1) pacificStarts.push([0, c]);
  const atlanticStarts = [];
  for (let r = 0; r < rows; r += 1) atlanticStarts.push([r, cols - 1]);
  for (let c = 0; c < cols - 1; c += 1) atlanticStarts.push([rows - 1, c]);

  emit("setup", 1, 3, "Read the height grid. Water flows downhill, so we flood uphill from each ocean.");
  emit("setup", 2, 6, `The grid is ${rows} x ${cols}. Pacific borders the top row and left column; Atlantic borders the bottom row and right column.`);
  flood("pacific", pacificStarts, 3, 18);
  flood("atlantic", atlanticStarts, 4, 19);

  const answer = sortedCells(reach.pacific).filter(([r, c]) => reach.atlantic.has(key(r, c)));
  emit("compare", 5, 21, "Keep only the cells that both waves reached.", { answer: null });
  emit("done", 5, 21,
    answer.length === 0
      ? "No cell is reached by both oceans."
      : `${answer.length} cell${answer.length === 1 ? "" : "s"} reached by both oceans.`,
    { answer });

  return { rows, cols, heights, answer, frames };
}
