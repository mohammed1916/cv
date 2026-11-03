import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

const solve = (arr1, arr2, d) => buildTrace(parseInput(JSON.stringify({ arr1, arr2, d }))).result

// Independent oracle: a value counts when every arr2 value is strictly farther than d.
function brute(arr1, arr2, d) {
  let count = 0
  for (const a of arr1) if (arr2.every(b => Math.abs(a - b) > d)) count += 1
  return count
}

test('hand-checked arrays', () => {
  assert.equal(solve([6, 2, 20], [1, 30], 3), 2)
  assert.equal(solve([1], [1], 0), 0)
  assert.equal(solve([1], [3], 1), 1)
  assert.equal(solve([1], [3], 2), 0)
  assert.equal(solve([1], [4], 2), 1)
  assert.equal(solve([1], [3], 3), 0)
})

test('random arrays agree with the all-pairs oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return (state >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const arr1 = Array.from({ length: 1 + rand(12) }, () => rand(41) - 20)
    const arr2 = Array.from({ length: 1 + rand(12) }, () => rand(41) - 20)
    const d = rand(15)
    assert.equal(solve(arr1, arr2, d), brute(arr1, arr2, d), JSON.stringify({ arr1, arr2, d }))
  }
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"arr1":[6,2,20],"arr2":[1,30],"d":3}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"arr1":[],"arr2":[1],"d":1}'), /integers/)
  assert.throws(() => parseInput('{"arr1":[1],"arr2":[1],"d":-1}'), /d from 0/)
})
