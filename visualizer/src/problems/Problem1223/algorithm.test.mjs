import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: enumerate every die sequence and reject any run longer than its face limit.
function brute(n, rollMax) {
  let count = 0
  const extend = (seq) => {
    if (seq.length === n) { count++; return }
    for (let face = 0; face < 6; face++) {
      const tail = seq.length > 0 && seq[seq.length - 1] === face ? seq : null
      let run = 0
      for (let i = seq.length - 1; i >= 0 && seq[i] === face; i--) run++
      if (run + 1 <= rollMax[face]) extend([...seq, face])
      void tail
    }
  }
  extend([])
  return count
}

test('one roll allows all six faces, and a limit of one blocks every immediate repeat', () => {
  assert.equal(buildTrace({ n: 1, rollMax: [1, 2, 3, 4, 5, 6] }).result, 6)
  assert.equal(buildTrace({ n: 6, rollMax: [1, 1, 1, 1, 1, 1] }).result, 6 * 5 * 5 * 5 * 5 * 5)
})

test('limits longer than the sequence impose no restriction', () => {
  assert.equal(buildTrace({ n: 4, rollMax: [5, 5, 5, 5, 5, 5] }).result, 6 ** 4)
})

test('different face limits agree with exhaustive enumeration for short sequences', () => {
  const cases = [[9, [1, 3, 2, 4, 2, 3]], [5, [2, 1, 3, 1, 2, 2]], [6, [3, 3, 1, 2, 1, 2]]]
  for (const [n, rollMax] of cases) assert.equal(buildTrace({ n, rollMax }).result, brute(n, rollMax), JSON.stringify(rollMax))
})

test('random small limits agree with exhaustive enumeration', () => {
  let state = 23
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return (state >>> 16) % m }
  for (let t = 0; t < 60; t++) {
    const rollMax = Array.from({ length: 6 }, () => 1 + rand(3))
    const n = 1 + rand(5)
    assert.equal(buildTrace({ n, rollMax }).result, brute(n, rollMax), JSON.stringify({ n, rollMax }))
  }
})

test('large inputs stay under the modulus and finish with a total frame', () => {
  const run = buildTrace({ n: 3000, rollMax: [15, 15, 15, 15, 15, 15] })
  assert.ok(run.result >= 0 && run.result < 1000000007)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput enforces six faces and limits between one and fifteen', () => {
  assert.throws(() => parseInput('{"n":3,"rollMax":[1,2,3]}'))
  assert.throws(() => parseInput('{"n":3,"rollMax":[0,2,3,1,1,1]}'))
  assert.deepEqual(parseInput('{"n":2,"rollMax":[1,1,1,1,1,1]}').n, 2)
})
