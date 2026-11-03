import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Oracle: sort by count, then value descending, using a plain comparator on a copy.
function oracle(nums) {
  const count = v => nums.filter(x => x === v).length
  return [...nums].sort((a, b) => count(a) - count(b) || b - a)
}

test('own sample: counts decide first, then larger values come first', () => {
  assert.deepEqual(buildTrace(parseInput('{"nums":[4,1,1,7,4,9,9,9,2]}')).result, [7, 2, 4, 4, 1, 1, 9, 9, 9])
})

test('a single value stays unchanged', () => {
  assert.deepEqual(buildTrace({ nums: [5, 5, 5] }).result, [5, 5, 5])
})

test('random lists agree with the comparator oracle', () => {
  let state = 31
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rand(20) }, () => rand(21) - 10)
    assert.deepEqual(buildTrace({ nums }).result, oracle(nums), JSON.stringify(nums))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ nums: [3, 3, 8] })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 5)
  }
  assert.ok(python.includes('def frequency_sort'))
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"nums":[]}'), /1 to 20/)
  assert.throws(() => parseInput('{"nums":[1.5]}'), /integer/)
})
