import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (numbers, target) => buildTrace({ numbers, target }).result

test('sample inputs return the 1-based positions of the pair', () => {
  assert.deepEqual(solve([1, 3, 4, 6, 9], 10), [1, 5])
  assert.deepEqual(solve([2, 2, 5, 7], 4), [1, 2])
})

test('negative values and repeated values work', () => {
  assert.deepEqual(solve([-4, -1, 0, 2, 5, 8], 1), [1, 5])
  assert.deepEqual(solve([3, 3, 3], 6), [1, 3])
})

test('no pair gives null and a final frame', () => {
  assert.equal(solve([1, 2, 3, 4], 100), null)
  assert.equal(buildTrace({ numbers: [1, 2, 3, 4], target: 100 }).frames.at(-1).phase, 'done')
})

// Independent oracle: brute-force every pair. Any answer must be a valid, ordered pair, and null only when none exists.
test('random sorted arrays agree with a brute-force oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const numbers = Array.from({ length: 2 + rnd(10) }, () => rnd(21) - 10).sort((a, b) => a - b)
    const target = rnd(31) - 15
    let exists = false
    for (let i = 0; i < numbers.length; i++) for (let j = i + 1; j < numbers.length; j++) if (numbers[i] + numbers[j] === target) exists = true
    const got = solve(numbers, target)
    const label = JSON.stringify({ numbers, target })
    if (!exists) assert.equal(got, null, label)
    else {
      assert.ok(Array.isArray(got), label)
      assert.ok(got[0] < got[1], label)
      assert.equal(numbers[got[0] - 1] + numbers[got[1] - 1], target, label)
    }
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"numbers":[3,1],"target":4}'), /sorted/)
  assert.throws(() => parseInput('{"numbers":[1],"target":4}'), /2 to 30/)
  assert.throws(() => parseInput('{"numbers":[1,2],"target":"3"}'), /target/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of buildTrace({ numbers: [1, 3, 4, 6, 9], target: 10 }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
