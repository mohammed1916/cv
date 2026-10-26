import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildPermutations, code, TRACE_LIMIT } from './Problem47/algorithm.js';
import { generateSteps, SOLUTION_CODE } from './Problem52/algorithm.js';

function python(source, entry, inputs) {
  const output = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nf=eval(p["entry"])\nprint(json.dumps([f(value) for value in p["inputs"]]))'], { input: JSON.stringify({ source, entry, inputs }), encoding: 'utf8' });
  assert.equal(output.status, 0, output.stderr || output.error?.message);
  return JSON.parse(output.stdout);
}

test('unique permutations agree with Python and maintain immutable choice/undo frames', () => {
  const inputs = [[1,1,2], [1,2,3], [2,2,2], [-1,-1,2,2], [0]];
  const expected = python(code.map(line => line.text).join('\n'), 'permuteUnique', inputs);
  inputs.forEach((nums, index) => {
    const story = buildPermutations({ nums: JSON.stringify(nums) });
    assert.deepEqual(story.results, expected[index]);
    assert.equal(new Set(story.results.map(result => JSON.stringify(result))).size, story.results.length);
    assert.deepEqual(story.frames[0].path, []);
    for (const frame of story.frames) {
      assert.equal(new Set(frame.path).size, frame.path.length);
      if (frame.activeLine === 7) assert.equal(frame.path.length, nums.length);
      if (frame.activeLine === 13) {
        assert.equal(story.nums[frame.candidate], story.nums[frame.candidate - 1]);
        assert.equal(frame.path.includes(frame.candidate - 1), false);
      }
      if (frame.activeLine === 16) assert.equal(frame.path.includes(frame.candidate), false);
    }
    assert.equal(story.frames.at(-1).resultCount, expected[index].length);
  });
});

test('eight distinct numbers compute all 40320 results with bounded playback memory', () => {
  const story = buildPermutations({ nums: '[1,2,3,4,5,6,7,8]' });
  assert.equal(story.results.length, 40320);
  assert.equal(new Set(story.results.map(result => result.join(','))).size, 40320);
  assert.equal(story.truncated, true);
  assert.equal(story.frames.length, TRACE_LIMIT + 1);
  assert.equal(story.frames.at(-1).resultCount, 40320);
});

test('N-Queens II Python and visual trace return known counts', () => {
  const expected = [1,0,0,2,10,4,40,92,352];
  assert.deepEqual(python(SOLUTION_CODE.map(line => line.text).join('\n'), 'totalNQueens', [1,2,3,4,5,6,7,8,9]), expected);
  for (let n = 1; n <= 9; n++) {
    const frames = generateSteps(n);
    assert.equal(frames.at(-1).solutions, expected[n-1]);
    assert.equal(frames[0].boardRef.flat().includes('Q'), false);
    for (const frame of frames.filter(frame => frame.phase === 'solution')) {
      const columns = frame.boardRef.map(row => row.indexOf('Q'));
      assert.equal(new Set(columns).size, n);
      assert.equal(new Set(columns.map((col,row) => col-row)).size, n);
      assert.equal(new Set(columns.map((col,row) => col+row)).size, n);
    }
  }
});

test('invalid backtracking inputs are rejected', () => {
  for (const nums of ['[]', '[1.5]', '[11]', '{}', 'bad']) assert.throws(() => buildPermutations({ nums }));
  for (const n of [0, -1, 2.5, 10, NaN]) assert.throws(() => generateSteps(n));
});
