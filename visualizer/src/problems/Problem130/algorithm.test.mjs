import test from "node:test";
import assert from "node:assert/strict";
import { CODE, parseBoardInput, buildSurroundedStory } from "./algorithm.js";

test("CODE export matches Python reference implementation", () => {
  assert.equal(Array.isArray(CODE), true);
  assert.equal(CODE.length, 16);
  assert.equal(CODE[0], "def solve(board):");
  assert.equal(CODE[1], "    if not board or not board[0]: return");
  assert.equal(CODE[2], "    R, C = len(board), len(board[0])");
  assert.equal(CODE[3], "    def dfs(r, c):");
  assert.equal(CODE[4], "        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != 'O':");
  assert.equal(CODE[5], "            return");
  assert.equal(CODE[6], "        board[r][c] = 'E'  # Escape/Safe");
  assert.equal(CODE[7], "        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)");
  assert.equal(CODE[8], "    for r in range(R):");
  assert.equal(CODE[9], "        dfs(r, 0); dfs(r, C-1)");
  assert.equal(CODE[10], "    for c in range(C):");
  assert.equal(CODE[11], "        dfs(0, c); dfs(R-1, c)");
  assert.equal(CODE[12], "    for r in range(R):");
  assert.equal(CODE[13], "        for c in range(C):");
  assert.equal(CODE[14], "            if board[r][c] == 'O': board[r][c] = 'X'");
  assert.equal(CODE[15], "            elif board[r][c] == 'E': board[r][c] = 'O'");
});

test("parseBoardInput validates input types, JSON, dimensions, and characters", () => {
  // Empty / missing inputs
  assert.throws(() => parseBoardInput(null), /Input cannot be empty/);
  assert.throws(() => parseBoardInput(undefined), /Input cannot be empty/);
  assert.throws(() => parseBoardInput(""), /Input cannot be empty/);
  assert.throws(() => parseBoardInput("   "), /Input cannot be empty/);

  // Invalid JSON
  assert.throws(() => parseBoardInput("not json"), /Invalid JSON format/);
  assert.throws(() => parseBoardInput("{ foo: 123 }"), /Invalid JSON format/);

  // Non-array
  assert.throws(() => parseBoardInput(123), /Board must be a 2D array/);
  assert.throws(() => parseBoardInput({}), /Board must be a 2D array/);

  // Empty board
  assert.deepEqual(parseBoardInput("[]"), []);
  assert.deepEqual(parseBoardInput([]), []);

  // Row limits (max 20x20)
  const tooManyRows = Array.from({ length: 21 }, () => ["X"]);
  assert.throws(() => parseBoardInput(tooManyRows), /Board row count exceeds 20/);

  const tooManyCols = [Array.from({ length: 21 }, () => "X")];
  assert.throws(() => parseBoardInput(tooManyCols), /Board column count exceeds 20/);

  // Non-array row
  assert.throws(() => parseBoardInput(["X", "O"]), /Row 0 must be an array/);

  // Non-rectangular matrix
  assert.throws(
    () => parseBoardInput([["X", "O"], ["X"]]),
    /Board must be rectangular/
  );

  // Invalid characters
  assert.throws(
    () => parseBoardInput([["X", "A"], ["X", "O"]]),
    /must be 'X' or 'O'/
  );
  assert.throws(
    () => parseBoardInput([["X", 1], ["X", "O"]]),
    /must be string 'X' or 'O'/
  );

  // Valid inputs with normalization (handles lowercase and single quotes)
  const fromSingleQuotes = parseBoardInput("[['x', 'o'], ['O', 'X']]");
  assert.deepEqual(fromSingleQuotes, [
    ["X", "O"],
    ["O", "X"],
  ]);

  const fromArray = parseBoardInput([
    ["x", "o"],
    ["o", "x"],
  ]);
  assert.deepEqual(fromArray, [
    ["X", "O"],
    ["O", "X"],
  ]);
});

test("standard 4x4 board: surrounded regions are captured, border-connected preserved", () => {
  const input = [
    ["X", "X", "X", "X"],
    ["X", "O", "O", "X"],
    ["X", "X", "O", "X"],
    ["X", "O", "X", "X"],
  ];

  const expectedFinal = [
    ["X", "X", "X", "X"],
    ["X", "X", "X", "X"],
    ["X", "X", "X", "X"],
    ["X", "O", "X", "X"],
  ];

  const story = buildSurroundedStory(input);
  assert.deepEqual(story.initialBoard, input);
  assert.deepEqual(story.finalBoard, expectedFinal);
  assert.equal(story.rows, 4);
  assert.equal(story.cols, 4);
  assert.equal(story.stats.capturedCount, 3);
  assert.equal(story.stats.escapedCount, 1);

  // Check frames existence and key milestones
  const visitFrames = story.frames.filter((f) => f.action === "dfs-visit");
  assert.equal(visitFrames.length, 1); // Only (3, 1) was reached from border
  assert.deepEqual(visitFrames[0].currentCell, [3, 1]);

  const captureFrames = story.frames.filter((f) => f.action === "sweep-capture");
  assert.equal(captureFrames.length, 3);
  const capturedCells = captureFrames.map((f) => f.currentCell);
  assert.deepEqual(capturedCells, [
    [1, 1],
    [1, 2],
    [2, 2],
  ]);

  const restoreFrames = story.frames.filter((f) => f.action === "sweep-restore");
  assert.equal(restoreFrames.length, 1);
  assert.deepEqual(restoreFrames[0].currentCell, [3, 1]);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.deepEqual(lastFrame.board, expectedFinal);
});

test("handles 1x1 board edge cases for both 'O' and 'X'", () => {
  // Single 'O' on border: cannot be surrounded
  const storyO = buildSurroundedStory([["O"]]);
  assert.deepEqual(storyO.finalBoard, [["O"]]);
  assert.equal(storyO.stats.capturedCount, 0);
  assert.equal(storyO.stats.escapedCount, 1);

  // Single 'X' on border
  const storyX = buildSurroundedStory([["X"]]);
  assert.deepEqual(storyX.finalBoard, [["X"]]);
  assert.equal(storyX.stats.capturedCount, 0);
  assert.equal(storyX.stats.escapedCount, 0);
});

test("handles all 'X' matrix", () => {
  const input = [
    ["X", "X", "X"],
    ["X", "X", "X"],
    ["X", "X", "X"],
  ];
  const story = buildSurroundedStory(input);
  assert.deepEqual(story.finalBoard, input);
  assert.equal(story.stats.capturedCount, 0);
  assert.equal(story.stats.escapedCount, 0);

  // Verify sweep runs and finishes cleanly
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.deepEqual(lastFrame.board, input);
});

test("handles all 'O' matrix: all cells escape through borders", () => {
  const input = [
    ["O", "O", "O"],
    ["O", "O", "O"],
    ["O", "O", "O"],
  ];
  const story = buildSurroundedStory(input);
  assert.deepEqual(story.finalBoard, input);
  assert.equal(story.stats.capturedCount, 0);
  assert.equal(story.stats.escapedCount, 9);

  // All 9 cells should be visited and restored
  const restoreFrames = story.frames.filter((f) => f.action === "sweep-restore");
  assert.equal(restoreFrames.length, 9);
});

test("handles border-connected serpentine chains and isolated interior islands", () => {
  // Chain: (0,0) -> (1,0) -> (1,1) -> (2,1) connects to left/top border
  // Isolated surrounded island: (1, 3) and (2, 3) strictly inside interior
  const input = [
    ["O", "X", "X", "X", "X"],
    ["O", "O", "X", "O", "X"],
    ["X", "O", "X", "O", "X"],
    ["X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X"],
  ];

  const expectedFinal = [
    ["O", "X", "X", "X", "X"],
    ["O", "O", "X", "X", "X"], // (1, 3) captured
    ["X", "O", "X", "X", "X"], // (2, 3) captured
    ["X", "X", "X", "X", "X"],
    ["X", "X", "X", "X", "X"],
  ];

  const story = buildSurroundedStory(input);
  assert.deepEqual(story.finalBoard, expectedFinal);
  assert.equal(story.stats.capturedCount, 2); // (1, 3) and (2, 3)
  assert.equal(story.stats.escapedCount, 4); // (0,0), (1,0), (1,1), (2,1)
});

test("handles enclosed donut ring: all inner 'O' cells captured", () => {
  const input = [
    ["X", "X", "X", "X", "X"],
    ["X", "O", "O", "O", "X"],
    ["X", "O", "X", "O", "X"],
    ["X", "O", "O", "O", "X"],
    ["X", "X", "X", "X", "X"],
  ];

  const story = buildSurroundedStory(input);
  // All 8 'O' cells in the donut are surrounded by 'X'
  assert.equal(story.stats.capturedCount, 8);
  assert.equal(story.stats.escapedCount, 0);

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      assert.equal(story.finalBoard[r][c], "X");
    }
  }
});

test("trace frames are immutable and correctly snapshot board state", () => {
  const input = [
    ["X", "X", "X"],
    ["X", "O", "X"],
    ["X", "X", "X"],
  ];
  const story = buildSurroundedStory(input);

  // During Phase 1 init, cell (1, 1) is 'O'
  const initFrame = story.frames[0];
  assert.equal(initFrame.board[1][1], "O");

  // In the capture frame, cell (1, 1) is flipped to 'X'
  const captureFrame = story.frames.find((f) => f.action === "sweep-capture");
  assert.ok(captureFrame);
  assert.equal(captureFrame.board[1][1], "X");

  // Ensure initFrame was NOT mutated by subsequent flips
  assert.equal(initFrame.board[1][1], "O");

  // Mutating the returned finalBoard does not mutate any frame snapshots
  story.finalBoard[1][1] = "MUTATED";
  assert.equal(captureFrame.board[1][1], "X");
  assert.equal(initFrame.board[1][1], "O");

  // Check required frame schema
  for (const frame of story.frames) {
    assert.equal(typeof frame.activeLine, "number");
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 16);
    assert.ok(["init", "border-scan", "sweep", "done"].includes(frame.phase));
    assert.equal(typeof frame.message, "string");
    assert.equal(typeof frame.explanation, "string");
    assert.ok(Array.isArray(frame.board));
    assert.ok(Array.isArray(frame.escapedCells));
    assert.ok(Array.isArray(frame.capturedCells));
    assert.ok(Array.isArray(frame.restoredCells));
    assert.ok(frame.stats);
  }
});
