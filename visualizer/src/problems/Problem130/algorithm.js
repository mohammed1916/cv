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
