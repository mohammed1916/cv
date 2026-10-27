import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace(parseInput(JSON.stringify({ nums, target }))).result

test('2835 official examples', () => {
  assert.equal(solve([1, 2, 8], 7), 1)
  assert.equal(solve([1, 32, 1, 2], 12), 2)
  assert.equal(solve([1, 32, 1], 35), -1)
})

test('2835 edge cases', () => {
  assert.equal(solve([1], 1), 0)
  assert.equal(solve([2], 1), 1)
  assert.equal(solve([4], 3), 2)
})

test('2835 rejects values that are not powers of two', () => {
  assert.throws(() => parseInput('{"nums":[3],"target":1}'))
  assert.throws(() => parseInput('{"nums":[1],"target":0}'))
})

// Independent oracle: breadth-first search over multisets of powers of two, applying the splitting operation.
function oracle(nums, target) {
  const reaches = arr => {
    const sums = new Set([0])
    for (const v of arr) for (const s of [...sums]) sums.add(s + v)
    return sums.has(target)
  }
  const key = arr => [...arr].sort((a, b) => a - b).join(',')
  const start = [...nums]
  const seen = new Set([key(start)])
  let frontier = [start]
  for (let depth = 0; frontier.length; depth++) {
    if (frontier.some(reaches)) return depth
    const next = []
    for (const arr of frontier) {
      arr.forEach((v, i) => {
        if (v <= 1) return
        const rest = arr.filter((_, j) => j !== i)
        const child = [...rest, v / 2, v / 2]
        const k = key(child)
        if (!seen.has(k)) { seen.add(k); next.push(child) }
      })
    }
    frontier = next
  }
  return -1
}

test('2835 small multisets match a breadth-first search over splits', () => {
  let seed = 2835
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pow = [1, 2, 4, 8]
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => pow[rnd(4)])
    const target = 1 + rnd(12)
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
