import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007n
const ALLOWED = { a: 'eiu', e: 'ai', i: 'eo', o: 'i', u: 'io' }

// Independent oracle: enumerate every string of length n over the five vowels that obeys the pairwise rule.
function brute(n) {
  let count = 0
  const extend = (prev, length) => {
    if (length === n) { count++; return }
    for (const v of 'aeiou') {
      if (prev === null || ALLOWED[prev].includes(v)) extend(v, length + 1)
    }
  }
  extend(null, 0)
  return count
}

test('length 1 gives five strings and length 2 gives ten', () => {
  assert.equal(buildTrace({ n: 1 }).result, 5)
  assert.equal(buildTrace({ n: 2 }).result, 10)
})

test('small lengths agree with exhaustive enumeration', () => {
  for (let n = 1; n <= 7; n++) assert.equal(buildTrace({ n }).result, brute(n), `n=${n}`)
})

test('modular accumulation stays in range for long lengths', () => {
  const result = buildTrace({ n: 200 }).result
  assert.ok(Number.isInteger(result) && result >= 0 && result < 1000000007)
})

test('every frame has a phase, a valid code line and narration', () => {
  const run = buildTrace({ n: 4 })
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 13)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects out-of-range n', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":201}'))
  assert.deepEqual(parseInput('{"n":3}'), { n: 3 })
})
