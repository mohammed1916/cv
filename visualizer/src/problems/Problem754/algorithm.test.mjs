import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = t => buildTrace(parseInput(String(t))).result
// Oracle: BFS over positions, step i moves +-i.
function bfs(target) {
  let layer = new Set([0]); let k = 0
  while (!layer.has(target)) { k++; const next = new Set(); for (const p of layer) { next.add(p + k); next.add(p - k) } layer = next }
  return k
}
test('official examples', () => { assert.equal(solve(2), 3); assert.equal(solve(3), 2) })
test('all targets 1..60 and negatives vs BFS', () => {
  for (let t = 1; t <= 60; t++) { assert.equal(solve(t), bfs(t)); assert.equal(solve(-t), bfs(t)) }
})
test('frames end done and invalid input rejected', () => {
  assert.equal(buildTrace(7).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('0'), /non-zero/)
  assert.throws(() => parseInput('1.5'), /integer/)
  assert.throws(() => parseInput('99999'), /cap/)
})
