import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = target => buildTrace(parseInput(JSON.stringify({ target }))).result

test('1354 official examples', () => {
  assert.equal(solve([9, 3, 5]), true)
  assert.equal(solve([1, 1, 1, 2]), false)
  assert.equal(solve([8, 5]), true)
})

test('1354 a single value is reachable only when it is 1', () => {
  assert.equal(solve([1]), true)
  assert.equal(solve([2]), false)
})

test('1354 rejects values outside 1 to 12', () => {
  assert.throws(() => parseInput('{"target":[0,1]}'))
})

// Independent oracle: breadth-first search forward from all ones; each step replaces one value with the sum of all values.
// Values only grow, so any state with a value above the largest target can be dropped.
function oracle(target) {
  const limit = Math.max(...target)
  const key = arr => arr.join(',')
  const start = Array(target.length).fill(1)
  const seen = new Set([key(start)])
  const queue = [start]
  const goal = key(target)
  while (queue.length) {
    const cur = queue.shift()
    if (key(cur) === goal) return true
    const sum = cur.reduce((a, b) => a + b, 0)
    for (let j = 0; j < cur.length; j++) {
      const next = [...cur]
      next[j] = sum
      if (next.some(v => v > limit)) continue
      const k = key(next)
      if (!seen.has(k)) { seen.add(k); queue.push(next) }
    }
  }
  return false
}

test('1354 random targets match a forward search oracle', () => {
  let seed = 1354
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const target = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(12))
    assert.equal(solve(target), oracle(target), JSON.stringify(target))
  }
})
