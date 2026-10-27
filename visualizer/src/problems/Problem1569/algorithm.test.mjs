import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1569 official examples', () => {
  assert.equal(solve([2, 1, 3]), 1)
  assert.equal(solve([3, 4, 5, 1, 2]), 5)
  assert.equal(solve([1, 2, 3]), 0)
})

test('1569 a single value has no other order', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([2, 1]), 0)
})

test('1569 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: try every ordering, build its binary search tree and compare shapes with the original.
function oracle(nums) {
  const shape = values => {
    let root = null
    const insert = (node, v) => {
      if (node === null) return { v, left: null, right: null }
      if (v < node.v) node.left = insert(node.left, v)
      else node.right = insert(node.right, v)
      return node
    }
    for (const v of values) root = insert(root, v)
    const text = node => (node === null ? '.' : `(${node.v} ${text(node.left)} ${text(node.right)})`)
    return text(root)
  }
  const target = shape(nums)
  let count = 0
  const permute = (prefix, rest) => {
    if (rest.length === 0) {
      if (shape(prefix) === target) count++
      return
    }
    rest.forEach((v, i) => permute([...prefix, v], [...rest.slice(0, i), ...rest.slice(i + 1)]))
  }
  permute([], nums)
  return count - 1
}

test('1569 random distinct arrays match the permutation oracle', () => {
  let seed = 1569
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const pool = Array.from({ length: 12 }, (_, i) => i + 1)
    const nums = Array.from({ length: 1 + rnd(6) }, () => pool.splice(rnd(pool.length), 1)[0])
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
