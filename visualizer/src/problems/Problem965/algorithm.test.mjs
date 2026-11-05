import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('965 univalued check matches a scan of every entry', () => {
  const samples = [
    [3, 3, 3, 3, null, 3, 3], [7, 7, 8, 7, 7], [6, 6, null, 6], [5], [2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, null, 2], [9, null, 9, null, null, 9], [4, 4, 4, 4, 4, 4, 5],
  ]
  for (const tree of samples) {
    const expected = tree.every(value => value === null || value === tree[0])
    assert.equal(buildTrace(parseInput(JSON.stringify({ tree }))).result, expected, JSON.stringify(tree))
  }
})

test('965 stops at the first mismatch', () => {
  const run = buildTrace(parseInput('{"tree":[7,7,8,7,7]}'))
  assert.equal(run.result, false)
  assert.equal(run.frames[run.frames.length - 2].mismatch, 2)
})

test('965 rejects a child under a missing parent', () => {
  assert.throws(() => parseInput('{"tree":[1,null,2,null,null,null,null,3]}'))
  assert.throws(() => parseInput('{"tree":[1,null,null,2]}'))
})
