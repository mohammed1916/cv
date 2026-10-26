import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Full minimax: the mover loses if erasing leaves XOR 0 (and wins outright if XOR is already 0).
function alice(nums) {
  const memo = new Map()
  const x0 = a => a.reduce((p, q) => p ^ q, 0)
  const wins = a => { // does the player to move win?
    if (x0(a) === 0) return true
    const key = [...a].sort((p, q) => p - q).join(',')
    if (memo.has(key)) return memo.get(key)
    let res = false
    for (let i = 0; i < a.length && !res; i++) {
      const b = a.filter((_, j) => j !== i)
      if (x0(b) !== 0 && !wins(b)) res = true
    }
    memo.set(key, res)
    return res
  }
  return wins(nums)
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('[1,1,2]')).result, false)
  assert.equal(buildTrace(parseInput('[0,1]')).result, true)
  assert.equal(buildTrace(parseInput('[1,2,3]')).result, true)
})
test('random vs minimax', () => {
  let seed = 21
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 400; t++) {
    const a = Array.from({ length: 1 + rnd(8) }, () => rnd(8))
    const r = buildTrace(a)
    assert.equal(r.result, alice(a), JSON.stringify(a))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('"x"'))
})
