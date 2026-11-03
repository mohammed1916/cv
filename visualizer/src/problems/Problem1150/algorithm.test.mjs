import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: count occurrences directly and compare with half the length.
function reference({ nums, target }) {
  const count = nums.filter(v => v === target).length
  return 2 * count > nums.length
}

function randomCase(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const n = 1 + rand(12)
  const nums = Array.from({ length: n }, () => rand(6)).sort((a, b) => a - b)
  return { nums, target: rand(7) }
}

test('examples and random sorted arrays agree with direct counting', () => {
  for (const example of examples) {
    const input = parseInput(example.input)
    assert.equal(buildTrace(input).result, reference(input), example.label)
  }
  for (let seed = 1; seed <= 300; seed++) {
    const input = randomCase(seed)
    assert.equal(buildTrace(input).result, reference(input), JSON.stringify(input))
  }
})

test('exactly half the length is not a majority', () => {
  assert.equal(buildTrace({ nums: [1, 2, 2, 3], target: 2 }).result, false)
  assert.equal(buildTrace({ nums: [2, 2, 2, 3], target: 2 }).result, true)
})

test('every frame has a declared phase, a valid code line, narration and a snapshot', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const run = buildTrace(parseInput(examples[0].input))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"nums":[3,1],"target":1}'), /sorted/)
  assert.throws(() => parseInput('[1,2]'), /nums/)
})
