import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (values, k) => buildTrace({ values, k }).result

test('sample inputs give the most competitive subsequence', () => {
  assert.deepEqual(solve([3, 5, 2, 6], 2), [2, 6])
  assert.deepEqual(solve([1, 2, 3, 4], 3), [1, 2, 3])
  assert.deepEqual(solve([3, 5, 2], 2), [3, 2])
})

test('a value that is smaller than the stack top pops earlier values', () => {
  assert.deepEqual(solve([9, 8, 1, 7], 2), [1, 7])
})

test('k equal to the length returns the values unchanged', () => {
  assert.deepEqual(solve([4, 2, 9], 3), [4, 2, 9])
})

// Independent oracle: enumerate every subsequence of length k and keep the lexicographically smallest one.
function bruteForce(values, k) {
  let best = null
  const n = values.length
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      if (best === null || cmp(chosen, best) < 0) best = [...chosen]
      return
    }
    for (let i = start; i <= n - (k - chosen.length); i++) {
      chosen.push(values[i])
      choose(i + 1, chosen)
      chosen.pop()
    }
  }
  choose(0, [])
  return best
}
function cmp(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

test('random inputs agree with brute-force enumeration of subsequences', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(9) }, () => rnd(10))
    const k = 1 + rnd(values.length)
    assert.deepEqual(solve(values, k), bruteForce(values, k), JSON.stringify({ values, k }))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"values":[1,2],"k":3}'), /k is an integer/)
  assert.throws(() => parseInput('{"values":[1,-2],"k":1}'), /0 to 1000/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of buildTrace({ values: [3, 5, 2, 6], k: 2 }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
