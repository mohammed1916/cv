
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrace, parseInput } from './algorithm.js';

const trace = (grid) =>
  buildTrace(parseInput(JSON.stringify({ grid })));

const solve = (grid) => trace(grid).result;

test('1267 official examples', () => {
  assert.equal(solve([[1, 0], [0, 1]]), 0);
  assert.equal(solve([[1, 0], [1, 1]]), 3);
  assert.equal(
    solve([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]),
    0
  );
});

test('1267 counts servers sharing only a column', () => {
  assert.equal(
    solve([
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
    ]),
    2
  );
});

test('1267 validates input', () => {
  assert.throws(() => parseInput('{"grid":[[2]]}'));
  assert.throws(() => parseInput('{"grid":[[1],[1,0]]}'));
  assert.throws(() => parseInput('{"grid":[]}'));
});

test('construction begins with empty count arrays', () => {
  const { frames } = trace([
    [1, 0],
    [1, 1],
  ]);

  assert.deepEqual(frames[0].rowCount, [null, null]);
  assert.deepEqual(frames[0].colCount, [null, null]);
  assert.equal(frames[0].phase, 'start');
  assert.equal(frames[1].phase, 'dimensions');
});

test('row counts are constructed before column counts', () => {
  const { frames } = trace([
    [1, 0],
    [1, 1],
  ]);

  const rowCommits = frames.filter(
    (frame) => frame.phase === 'row-commit'
  );

  const colCommits = frames.filter(
    (frame) => frame.phase === 'col-commit'
  );

  assert.deepEqual(
    rowCommits.map((frame) => frame.rowCount),
    [[1, null], [1, 2]]
  );

  assert.deepEqual(
    colCommits.map((frame) => frame.colCount),
    [[2, null], [2, 1]]
  );

  assert.ok(
    frames.indexOf(rowCommits.at(-1)) <
    frames.indexOf(colCommits[0])
  );
});

test('scan frames record previous + current = running', () => {
  const { frames } = trace([[1, 0, 1]]);

  const rowScans = frames.filter(
    (frame) => frame.phase === 'row-scan'
  );

  assert.deepEqual(
    rowScans.map((frame) => [
      frame.previousSum,
      frame.scanValue,
      frame.runningSum,
    ]),
    [
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 2],
    ]
  );
});

test('completed frames preserve earlier snapshots', () => {
  const { frames } = trace([
    [1, 0],
    [1, 1],
  ]);

  const firstCommit = frames.find(
    (frame) => frame.phase === 'row-commit'
  );

  const final = frames.at(-1);

  assert.deepEqual(firstCommit.rowCount, [1, null]);
  assert.deepEqual(firstCommit.colCount, [null, null]);
  assert.deepEqual(final.rowCount, [1, 2]);
  assert.deepEqual(final.colCount, [2, 1]);
  assert.equal(final.total, 3);
});

test('all Python line references are valid', () => {
  const { frames } = trace([[1, 1]]);
  for (const frame of frames) {
    assert.ok(frame.pythonLine >= 1);
    assert.ok(frame.activeLine >= 1);
  }
});

function oracle(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;

      let partner = false;

      for (let k = 0; k < cols; k++) {
        if (k !== c && grid[r][k] === 1) partner = true;
      }

      for (let k = 0; k < rows; k++) {
        if (k !== r && grid[k][c] === 1) partner = true;
      }

      if (partner) count++;
    }
  }

  return count;
}

test('1267 seeded random grids match independent oracle', () => {
  let seed = 1267;

  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed >> 16) % n;
  };

  for (let t = 0; t < 400; t++) {
    const rows = 1 + rnd(6);
    const cols = 1 + rnd(6);

    const grid = Array.from(
      { length: rows },
      () => Array.from(
        { length: cols },
        () => rnd(3) === 0 ? 1 : 0
      )
    );

    assert.equal(
      solve(grid),
      oracle(grid),
      JSON.stringify(grid)
    );
  }
});
