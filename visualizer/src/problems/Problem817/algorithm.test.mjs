import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: components = marked nodes minus adjacent marked pairs (a forest of paths has V - E components).
function oracle(head, nums) {
  const marked = head.filter(v => nums.includes(v)).length
  let edges = 0
  for (let i = 0; i + 1 < head.length; i++) if (nums.includes(head[i]) && nums.includes(head[i + 1])) edges++
  return marked - edges
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('{"head":[0,1,2,3],"nums":[0,1,3]}')).result, 2)
  assert.equal(buildTrace(parseInput('{"head":[0,1,2,3,4],"nums":[0,3,1,4]}')).result, 2)
})
test('random vs V - E', () => {
  let seed = 2
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const head = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [head[i], head[j]] = [head[j], head[i]] }
    const nums = head.filter(() => rnd(2)); if (!nums.length) nums.push(head[0])
    const r = buildTrace(parseInput(JSON.stringify({ head, nums })))
    assert.equal(r.result, oracle(head, nums))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('{"head":[0,1],"nums":[5]}'))
  assert.throws(() => parseInput('{"head":[0,0],"nums":[0]}'))
  assert.throws(() => parseInput('{"head":[0],"nums":[]}'))
})
