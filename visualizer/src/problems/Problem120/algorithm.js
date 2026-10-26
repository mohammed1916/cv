export const TRIANGLE_CODE = [
  "def minimumTotal(triangle):",
  "    if not triangle: return 0",
  "    dp = triangle[-1][:]",
  "    for i in range(len(triangle) - 2, -1, -1):",
  "        for j in range(len(triangle[i])):",
  "            dp[j] = triangle[i][j] + min(dp[j], dp[j + 1])",
  "    return dp[0]",
];

export function parseTriangleInput(input) {
  let parsed;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) throw new Error("Input cannot be empty");
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("Invalid JSON format for triangle");
    }
  } else {
    parsed = input;
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Triangle must be an array of rows");
  }

  if (parsed.length === 0) {
    return [];
  }

  if (parsed.length > 30) {
    throw new Error("Triangle height exceeds limit (max 30 rows)");
  }

  for (let r = 0; r < parsed.length; r++) {
    const row = parsed[r];
    if (!Array.isArray(row)) {
      throw new Error(`Row ${r} must be an array`);
    }
    if (row.length !== r + 1) {
      throw new Error(
        `Row ${r} must contain exactly ${r + 1} elements (got ${row.length})`,
      );
    }
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (typeof val !== "number" || !Number.isInteger(val)) {
        throw new Error(`Invalid integer at row ${r}, col ${c}`);
      }
      if (val < -100000 || val > 100000) {
        throw new Error(
          `Value ${val} out of reasonable range [-100000, 100000]`,
        );
      }
    }
  }

  return parsed;
}

export function buildTriangleStory(input) {
  const triangle = parseTriangleInput(input);
  const n = triangle.length;

  if (n === 0) {
    return {
      triangle: [],
      minTotal: 0,
      bestPath: [],
      frames: [
        {
          activeLine: 2,
          phase: "done",
          currentRow: -1,
          currentCol: -1,
          dp: [],
          chosenBelow: null,
          highlightRoute: [],
          message: "Empty triangle: minimum total is 0.",
          explanation: "With no elements, the total path sum is 0.",
        },
      ],
    };
  }

  // Precompute optimal choices for full path reconstruction
  // nextChoice[r][c] = c or c+1
  // minCost[r][c] = minimum sum from (r, c) to bottom
  const minCost = triangle.map((row) => [...row]);
  const nextChoice = Array.from({ length: n }, (_, r) =>
    new Array(r + 1).fill(-1),
  );

  for (let r = n - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      if (minCost[r + 1][c] <= minCost[r + 1][c + 1]) {
        minCost[r][c] += minCost[r + 1][c];
        nextChoice[r][c] = c;
      } else {
        minCost[r][c] += minCost[r + 1][c + 1];
        nextChoice[r][c] = c + 1;
      }
    }
  }

  const bestPath = [{ row: 0, col: 0 }];
  let currCol = 0;
  for (let r = 0; r < n - 1; r++) {
    currCol = nextChoice[r][currCol];
    bestPath.push({ row: r + 1, col: currCol });
  }

  const frames = [];

  // Frame 1: Init bottom row in dp
  let dp = [...triangle[n - 1]];
  frames.push({
    activeLine: 3,
    phase: "init",
    currentRow: n - 1,
    currentCol: -1,
    dp: [...dp],
    comparing: null,
    highlightRoute: [],
    message: `Initialize DP with the bottom row: [${dp.join(", ")}].`,
    explanation: `At the bottom level (row ${n - 1}), the path cost from each node to the bottom is just the node's own value.`,
  });

  // If single row, jump directly to return
  if (n === 1) {
    frames.push({
      activeLine: 7,
      phase: "done",
      currentRow: 0,
      currentCol: 0,
      dp: [...dp],
      comparing: null,
      highlightRoute: bestPath,
      message: `Minimum path sum is ${dp[0]}.`,
      explanation: `Single element triangle: the path is just [${triangle[0][0]}].`,
    });
    return { triangle, minTotal: dp[0], bestPath, frames };
  }

  // Bottom-up iteration
  for (let i = n - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const leftChildVal = dp[j];
      const rightChildVal = dp[j + 1];
      const chosenOffset = leftChildVal <= rightChildVal ? 0 : 1;
      const minChildVal = Math.min(leftChildVal, rightChildVal);
      const cellVal = triangle[i][j];

      // Frame: comparing the two options below
      frames.push({
        activeLine: 5,
        phase: "compare",
        currentRow: i,
        currentCol: j,
        dp: [...dp],
        comparing: {
          row: i,
          col: j,
          left: { row: i + 1, col: j, val: leftChildVal },
          right: { row: i + 1, col: j + 1, val: rightChildVal },
          chosen: chosenOffset,
        },
        highlightRoute: [],
        message: `Row ${i}, Col ${j} (${cellVal}): compare children below dp[${j}]=${leftChildVal} and dp[${j + 1}]=${rightChildVal}.`,
        explanation: `From (${i}, ${j}), adjacent options in the row below are index ${j} (cost ${leftChildVal}) and index ${j + 1} (cost ${rightChildVal}). Min is ${minChildVal}.`,
      });

      // Update dp[j]
      dp[j] = cellVal + minChildVal;

      // Frame: update dp[j]
      frames.push({
        activeLine: 6,
        phase: "update",
        currentRow: i,
        currentCol: j,
        dp: [...dp],
        comparing: {
          row: i,
          col: j,
          left: { row: i + 1, col: j, val: leftChildVal },
          right: { row: i + 1, col: j + 1, val: rightChildVal },
          chosen: chosenOffset,
        },
        highlightRoute: [],
        message: `dp[${j}] = ${cellVal} + min(${leftChildVal}, ${rightChildVal}) = ${dp[j]}.`,
        explanation: `Minimum sum starting from (${i}, ${j}) down to the base is ${dp[j]}.`,
      });
    }
  }

  // Final return
  frames.push({
    activeLine: 7,
    phase: "done",
    currentRow: 0,
    currentCol: 0,
    dp: [...dp],
    comparing: null,
    highlightRoute: bestPath,
    message: `Done! Minimum total path sum is dp[0] = ${dp[0]}.`,
    explanation: `The full minimal path is ${bestPath.map((p) => triangle[p.row][p.col]).join(" → ")} with sum ${dp[0]}.`,
  });

  return {
    triangle,
    minTotal: dp[0],
    bestPath,
    frames,
  };
}
