import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('3810 hand-checked small cases', () => {
  assert.equal(solve([1, 2, 3], [2, 1, 3]), 2)
  assert.equal(solve([4, 1, 4], [5, 1, 4]), 1)
  assert.equal(solve([7, 3, 7], [5, 5, 9]), 2)
  assert.equal(solve([2, 2], [2, 2]), 0)
})

// Independent oracle: breadth-first search over whole arrays. One operation picks a value x present
// in the array and updates every maximal run of x to the target values, as the statement describes.
function oracle(nums, target) {
  const key = a => a.join(',')
  const goal = key(target)
  let frontier = [nums.slice()]
  const seen = new Set([key(nums)])
  let depth = 0
  while (frontier.length) {
    if (frontier.some(a => key(a) === goal)) return depth
    const next = []
    for (const a of frontier) {
      for (const x of new Set(a)) {
        const b = a.slice()
        let i = 0
        while (i < b.length) {
          if (a[i] !== x) { i++; continue }
          let j = i
          while (j < b.length && a[j] === x) j++
          for (let k = i; k < j; k++) b[k] = target[k]
          i = j
        }
        const kb = key(b)
        if (!seen.has(kb)) { seen.add(kb); next.push(b) }
      }
    }
    frontier = next
    depth++
  }
  return -1
}

test('3810 matches a breadth-first search over segment operations', () => {
  let seed = 3
  const next = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return 1 + (seed % m) }
  for (let t = 0; t < 200; t++) {
    const n = next(5)
    const nums = Array.from({ length: n }, () => next(3))
    const target = Array.from({ length: n }, () => next(3))
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})

test('3810 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"target":[1]}'))
})
