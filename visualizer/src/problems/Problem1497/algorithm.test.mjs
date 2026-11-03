import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (arr, k) => buildTrace({ arr, k }).result
const mod = (v, k) => ((v % k) + k) % k

// Independent oracle: try every partner for the first value and recurse on what remains.
function canSplit(values, k) {
  if (values.length === 0) return true
  const [first, ...rest] = values
  return rest.some((other, j) => mod(first + other, k) === 0 && canSplit(rest.filter((_, t) => t !== j), k))
}

test('1497 sample arrays give the expected answers', () => {
  assert.equal(solve([2, 4, 1, 5, 3, 9], 6), true)
  assert.equal(solve([1, 2, 3, 4], 4), false)
  assert.equal(solve([-1, 1, 4, -4], 3), true)
})

test('1497 parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1,2,3],"k":4}'), /even/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":0}'), /k/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1497 random even-length arrays match the pairing oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 2 * (1 + rnd(4)) }, () => rnd(41) - 20)
    const k = 1 + rnd(6)
    assert.equal(solve(arr, k), canSplit(arr, k), JSON.stringify({ arr, k }))
  }
})

test('1497 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace({ arr: [2, 4, 1, 5, 3, 9], k: 6 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
