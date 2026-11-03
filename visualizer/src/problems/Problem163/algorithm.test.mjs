import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Oracle: list every value in [lower, upper] that is absent, then group consecutive values.
function oracle({ nums, lower, upper }) {
  const present = new Set(nums)
  const out = []
  for (let v = lower; v <= upper; v++) {
    if (present.has(v)) continue
    if (out.length && out.at(-1)[1] === v - 1) out.at(-1)[1] = v
    else out.push([v, v])
  }
  return out
}

test('own sample: gaps at the start, middle and end', () => {
  const run = buildTrace(parseInput('{"nums":[2,3,7,10],"lower":0,"upper":12}'))
  assert.deepEqual(run.result, [[0, 1], [4, 6], [8, 9], [11, 12]])
})

test('no numbers gives one range covering everything', () => {
  assert.deepEqual(buildTrace({ nums: [], lower: -3, upper: 2 }).result, [[-3, 2]])
})

test('full coverage gives no ranges', () => {
  assert.deepEqual(buildTrace({ nums: [4, 5, 6], lower: 4, upper: 6 }).result, [])
})

test('random cases agree with the value-by-value oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const lower = -20 + rand(20)
    const upper = lower + rand(30)
    const values = []
    for (let v = lower; v <= upper; v++) if (rand(3) === 0) values.push(v)
    const input = { nums: values.slice(0, 20), lower, upper }
    assert.deepEqual(buildTrace(input).result, oracle(input), JSON.stringify(input))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ nums: [2, 9], lower: 0, upper: 10 })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 5)
  }
  assert.ok(python.includes('def missing_ranges'))
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"nums":[5,5],"lower":0,"upper":9}'), /strictly increasing/)
  assert.throws(() => parseInput('{"nums":[12],"lower":0,"upper":9}'), /between lower and upper/)
})
