import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)

// Independent oracle: search integer combinations with small coefficients for one that sums to 1.
// Bezout coefficients for values up to 12 never exceed 12 in magnitude, so a bound of 30 is safe.
function oracle(nums) {
  const bound = 30
  let reachable = new Set([0])
  for (const x of nums) {
    const next = new Set()
    for (const s of reachable) {
      for (let c = -bound; c <= bound; c++) {
        const t = s + c * x
        if (Math.abs(t) <= 5000) next.add(t)
      }
    }
    reachable = next
  }
  return reachable.has(1)
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('the three samples give the expected answers', () => {
  const coprime = buildTrace(parseInput(examples[0].input))
  checkFrames(coprime)
  assert.equal(coprime.result, true)
  assert.equal(buildTrace(parseInput(examples[1].input)).result, false)
  assert.equal(buildTrace(parseInput(examples[2].input)).result, false)
})

test('random small arrays agree with the combination oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rand(4)
    const nums = Array.from({ length: n }, () => 1 + rand(12))
    assert.equal(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('a literal one makes the array good at once', () => {
  const trace = buildTrace([1000000000, 1])
  assert.equal(trace.result, true)
})

test('large values are handled with Euclid steps', () => {
  const trace = buildTrace([999999999, 1000000000])
  checkFrames(trace)
  assert.equal(trace.result, true)
  assert.equal(buildTrace([999999998, 1000000000]).result, false)
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,3]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[1000000001]'))
  assert.throws(() => parseInput('{"a":1}'))
})
