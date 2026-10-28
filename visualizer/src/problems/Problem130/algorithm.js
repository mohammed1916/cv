export const CODE = [
  "def solve(board):",
  "    if not board or not board[0]: return",
  "    R, C = len(board), len(board[0])",
  "    def dfs(r, c):",
  "        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != 'O':",
  "            return",
  "        board[r][c] = 'E'  # Escape/Safe",
  "        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)",
  "    for r in range(R):",
  "        dfs(r, 0); dfs(r, C-1)",
  "    for c in range(C):",
  "        dfs(0, c); dfs(R-1, c)",
  "    for r in range(R):",
  "        for c in range(C):",
  "            if board[r][c] == 'O': board[r][c] = 'X'",
  "            elif board[r][c] == 'E': board[r][c] = 'O'",
];

export function parseBoardInput(input) {
  if (input === null || input === undefined) {
    throw new Error("Input cannot be empty");
  }

  let parsed = input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      try {
        const normalized = trimmed.replace(/'/g, '"');
        parsed = JSON.parse(normalized);
      } catch {
        throw new Error("Invalid JSON format for board: must be a 2D array of 'X' and 'O'");
      }
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Board must be a 2D array");
  }

  if (parsed.length === 0) {
    return [];
  }

  if (parsed.length > 20) {
    throw new Error("Board row count exceeds 20 (max 20x20)");
  }

  const R = parsed.length;
  const C = parsed[0]?.length;

  for (let r = 0; r < R; r++) {
    const row = parsed[r];
    if (!Array.isArray(row)) {
      throw new Error(`Row ${r} must be an array`);
    }
    if (row.length !== C) {
      throw new Error(`Board must be rectangular: row ${r} has length ${row.length}, expected ${C}`);
    }
    if (row.length > 20) {
      throw new Error("Board column count exceeds 20 (max 20x20)");
    }
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (typeof cell !== "string") {
        throw new Error(`Invalid cell at (${r}, ${c}): must be string 'X' or 'O'`);
      }
      const val = cell.trim().toUpperCase();
      if (val !== "X" && val !== "O") {
        throw new Error(`Invalid cell '${cell}' at (${r}, ${c}): must be 'X' or 'O'`);
      }
    }
  }

  return parsed.map((row) => row.map((cell) => cell.trim().toUpperCase()));
}

export function buildSurroundedStory(input) {
  const board = parseBoardInput(input);
  const initialBoard = board.map((row) => [...row]);
  const R = board.length;
  const C = R > 0 ? board[0].length : 0;

  if (R === 0 || C === 0) {
    return {
      initialBoard,
      finalBoard: [],
      rows: 0,
      cols: 0,
      stats: {
        totalCells: 0,
        initialOCount: 0,
        escapedCount: 0,
        capturedCount: 0,
      },
      frames: [
        {
          activeLine: 2,
          phase: "done",
          action: "done",
          currentCell: null,
          recentCell: null,
          activeNeighbors: [],
          board: [],
          escapedCells: [],
          capturedCells: [],
          restoredCells: [],
          message: "Empty board: nothing to solve.",
          explanation: "The board has no cells, so solve returns immediately.",
          stats: { totalCells: 0, initialOCount: 0, escapedCount: 0, capturedCount: 0 },
        },
      ],
    };
  }

  let initialOCount = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (board[r][c] === "O") initialOCount++;
    }
  }

  const escapedCells = [];
  const capturedCells = [];
  const restoredCells = [];
  const frames = [];

  const addFrame = ({
    activeLine,
    phase,
    action,
    currentCell = null,
    recentCell = null,
    activeNeighbors = [],
    message,
    explanation,
  }) => {
    frames.push({
      activeLine,
      phase,
      action,
      currentCell,
      recentCell,
      activeNeighbors,
      board: board.map((row) => [...row]),
      escapedCells: escapedCells.map(([r, c]) => [r, c]),
      capturedCells: capturedCells.map(([r, c]) => [r, c]),
      restoredCells: restoredCells.map(([r, c]) => [r, c]),
      message,
      explanation,
      stats: {
        totalCells: R * C,
        initialOCount,
        escapedCount: escapedCells.length,
        capturedCount: capturedCells.length,
        restoredCount: restoredCells.length,
      },
    });
  };

  // Frame 1: Solve start
  addFrame({
    activeLine: 1,
    phase: "init",
    action: "init",
    message: `Initialized solve(board) on a ${R}×${C} matrix with ${initialOCount} 'O' cells.`,
    explanation: "Any region of 'O's completely enclosed by 'X' will be captured. Any 'O' connected to a boundary border can escape.",
  });

  // Frame 2: Dimensions set
  addFrame({
    activeLine: 3,
    phase: "init",
    action: "init",
    message: `Matrix dimensions established: R = ${R}, C = ${C}.`,
    explanation: "Phase 1: Scan all 4 borders (top, bottom, left, right). Any border 'O' triggers DFS to flood-fill and mark safe connected cells as 'E' (Escape).",
  });

  // DFS function
  const dfs = (r, c) => {
    if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== "O") {
      return;
    }

    board[r][c] = "E";
    escapedCells.push([r, c]);

    addFrame({
      activeLine: 7,
      phase: "border-scan",
      action: "dfs-visit",
      currentCell: [r, c],
      recentCell: [r, c],
      message: `Border connection at (${r}, ${c}): marked as 'E' (Safe Escape).`,
      explanation: `Cell (${r}, ${c}) is connected to the boundary. It cannot be surrounded, so it is temporarily marked 'E' (safe).`,
    });

    const directions = [
      [r + 1, c],
      [r - 1, c],
      [r, c + 1],
      [r, c - 1],
    ];

    const validONeighbors = directions.filter(
      ([nr, nc]) => nr >= 0 && nr < R && nc >= 0 && nc < C && board[nr][nc] === "O"
    );

    if (validONeighbors.length > 0) {
      addFrame({
        activeLine: 8,
        phase: "border-scan",
        action: "dfs-neighbor",
        currentCell: [r, c],
        activeNeighbors: validONeighbors,
        message: `DFS flood-fill expanding from (${r}, ${c}) to connected 'O' neighbor(s).`,
        explanation: `Flood-fill wave propagates to adjacent unvisited 'O' cells: ${validONeighbors.map(([nr, nc]) => `(${nr}, ${nc})`).join(", ")}.`,
      });
    }

    for (const [nr, nc] of directions) {
      dfs(nr, nc);
    }
  };

  // Phase 1: Scan vertical borders (cols 0 and C - 1)
  addFrame({
    activeLine: 9,
    phase: "border-scan",
    action: "scan-vertical",
    message: `Scanning vertical borders: Column 0 (left) and Column ${C - 1} (right).`,
    explanation: "Iterating through all rows to find any 'O' situated on the left or right edges of the board.",
  });

  for (let r = 0; r < R; r++) {
    if (board[r][0] === "O") {
      addFrame({
        activeLine: 10,
        phase: "border-scan",
        action: "border-start",
        currentCell: [r, 0],
        message: `Found border 'O' at left edge (${r}, 0). Initiating DFS flood-fill.`,
        explanation: `Starting DFS from left border cell (${r}, 0).`,
      });
      dfs(r, 0);
    }
    if (C - 1 > 0 && board[r][C - 1] === "O") {
      addFrame({
        activeLine: 10,
        phase: "border-scan",
        action: "border-start",
        currentCell: [r, C - 1],
        message: `Found border 'O' at right edge (${r}, ${C - 1}). Initiating DFS flood-fill.`,
        explanation: `Starting DFS from right border cell (${r}, ${C - 1}).`,
      });
      dfs(r, C - 1);
    }
  }

  // Phase 1: Scan horizontal borders (rows 0 and R - 1)
  addFrame({
    activeLine: 11,
    phase: "border-scan",
    action: "scan-horizontal",
    message: `Scanning horizontal borders: Row 0 (top) and Row ${R - 1} (bottom).`,
    explanation: "Iterating through all columns to find any 'O' situated on the top or bottom edges of the board.",
  });

  for (let c = 0; c < C; c++) {
    if (board[0][c] === "O") {
      addFrame({
        activeLine: 12,
        phase: "border-scan",
        action: "border-start",
        currentCell: [0, c],
        message: `Found border 'O' at top edge (0, ${c}). Initiating DFS flood-fill.`,
        explanation: `Starting DFS from top border cell (0, ${c}).`,
      });
      dfs(0, c);
    }
    if (R - 1 > 0 && board[R - 1][c] === "O") {
      addFrame({
        activeLine: 12,
        phase: "border-scan",
        action: "border-start",
        currentCell: [R - 1, c],
        message: `Found border 'O' at bottom edge (${R - 1}, ${c}). Initiating DFS flood-fill.`,
        explanation: `Starting DFS from bottom border cell (${R - 1}, ${c}).`,
      });
      dfs(R - 1, c);
    }
  }

  // Phase 2: Sweep entire board
  addFrame({
    activeLine: 13,
    phase: "sweep",
    action: "sweep-start",
    currentCell: null,
    message: `Phase 2: Sweeping entire ${R}×${C} board to capture surrounded 'O' and restore safe 'E'.`,
    explanation: "Any cell still labeled 'O' was never reached from any border, meaning it is surrounded by 'X'. We capture it to 'X'. Any cell labeled 'E' is restored to 'O'.",
  });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (board[r][c] === "O") {
        board[r][c] = "X";
        capturedCells.push([r, c]);
        addFrame({
          activeLine: 15,
          phase: "sweep",
          action: "sweep-capture",
          currentCell: [r, c],
          recentCell: [r, c],
          message: `Captured surrounded 'O' at (${r}, ${c}): flipped to 'X'.`,
          explanation: `Cell (${r}, ${c}) has no escape path to the border and is completely encircled by 'X'. It is captured and turned into 'X'.`,
        });
      } else if (board[r][c] === "E") {
        board[r][c] = "O";
        restoredCells.push([r, c]);
        addFrame({
          activeLine: 16,
          phase: "sweep",
          action: "sweep-restore",
          currentCell: [r, c],
          recentCell: [r, c],
          message: `Restored safe cell at (${r}, ${c}): 'E' -> 'O'.`,
          explanation: `Cell (${r}, ${c}) escaped capture via a border path. Its safe status is finalized by restoring it to 'O'.`,
        });
      }
    }
  }

  const finalBoard = board.map((row) => [...row]);

  addFrame({
    activeLine: 1,
    phase: "done",
    action: "done",
    currentCell: null,
    message: `Algorithm finished: ${capturedCells.length} surrounded 'O' captured, ${escapedCells.length} safe 'O' preserved.`,
    explanation: `All surrounded regions of 'O' have been flipped to 'X'. All border-connected regions have been preserved as 'O'.`,
  });

  return {
    initialBoard,
    finalBoard,
    rows: R,
    cols: C,
    stats: {
      totalCells: R * C,
      initialOCount,
      capturedCount: capturedCells.length,
      escapedCount: escapedCells.length,
    },
    frames,
  };
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_SIDE = 6
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"board": [["X","O"],["X","X"]]}.') }
  if (!data || typeof data !== 'object' || !Array.isArray(data.board)) throw new Error('Input must be an object with a "board" array of rows.')
  const board = data.board
  if (board.length < 1 || board.length > MAX_SIDE) throw new Error(`Use between 1 and ${MAX_SIDE} rows for this trace.`)
  const cols = Array.isArray(board[0]) ? board[0].length : 0
  if (cols < 1 || cols > MAX_SIDE) throw new Error(`Use between 1 and ${MAX_SIDE} columns for this trace.`)
  board.forEach(row => {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('Every row must have the same number of cells.')
    for (const c of row) if (c !== 'X' && c !== 'O') throw new Error('Cells must be "X" or "O".')
  })
  return { board }
}

export function buildTrace(input) {
  const src = input.board
  const rows = src.length, cols = src[0].length
  const board = src.map(r => [...r])
  const safe = Array.from({ length: rows }, () => Array(cols).fill(false))
  const frames = []
  const stack = []
  const mark = (r, c) => { safe[r][c] = true; stack.push([r, c]) }
  frames.push({ activeLine: L('mark every O on the border'), phase: 'border', row: null, col: null, board: board.map(r => [...r]), message: 'Start from the border: an O on the edge can never be surrounded.' })
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const onEdge = r === 0 || c === 0 || r === rows - 1 || c === cols - 1
    if (onEdge && board[r][c] === 'O' && !safe[r][c]) {
      mark(r, c)
      frames.push({ activeLine: L('mark every O on the border'), phase: 'border', row: r, col: c, board: board.map(x => [...x]), message: `Border O at (${r},${c}) is safe.` })
    }
  }
  while (stack.length) {
    const [r, c] = stack.pop()
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === 'O' && !safe[nr][nc]) {
        mark(nr, nc)
        frames.push({ activeLine: L('flood safe'), phase: 'flood', row: nr, col: nc, board: board.map(x => [...x]), message: `(${nr},${nc}) connects to a safe O, so it is safe too.` })
      }
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (board[r][c] === 'O' && !safe[r][c]) {
      board[r][c] = 'X'
      frames.push({ activeLine: L('change it to X'), phase: 'flip', row: r, col: c, board: board.map(x => [...x]), message: `(${r},${c}) is enclosed, so it flips to X.` })
    }
  }
  frames.push({ activeLine: L('return board'), phase: 'done', row: null, col: null, board: board.map(x => [...x]), message: 'Every O not connected to the border is now X.' })
  return { input, result: board, frames }
}

export const code = [
  { line: 1, text: 'flip every O region not connected to the border' },
  { line: 2, text: 'mark every O on the border as safe' },
  { line: 3, text: 'while there are safe cells to expand' },
  { line: 4, text: 'flood safe to O neighbours' },
  { line: 5, text: 'for each cell in the board' },
  { line: 6, text: 'if the cell is O and not safe, change it to X' },
  { line: 7, text: 'return board' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def solve(board):
    rows = len(board)
    cols = len(board[0])
    safe = set()
    stack = []
    for r in range(rows):
        for c in range(cols):
            on_edge = r in (0, rows - 1) or c in (0, cols - 1)
            if on_edge and board[r][c] == "O" and (r, c) not in safe:
                safe.add((r, c))
                stack.append((r, c))
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == "O" and (nr, nc) not in safe:
                safe.add((nr, nc))
                stack.append((nr, nc))
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O" and (r, c) not in safe:
                board[r][c] = "X"
    return board
`
