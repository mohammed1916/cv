import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = root => buildTrace({ root }).result

test('2471 official examples', () => {
  assert.equal(solve([1, 4, 3, 7, 6, 8, 5]), 3)
  assert.equal(solve([1, 3, 2, 7, null, 5, 4]), 2)
  assert.equal(solve([1]), 0)
})

test('2471 a level that is already sorted costs nothing', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7]), 0)
})

test('2471 rejects repeated values', () => {
  assert.throws(() => parseInput('{"root":[1,2,2]}'), /distinct/)
})

// Independent oracle: breadth-first search over every permutation of a level, one swap per move.
function minSwapsBrute(values) {
  const goal = [...values].sort((a, b) => a - b).join(',')
  const start = values.join(',')
  if (start === goal) return 0
  let frontier = [values]
  const seen = new Set([start])
  for (let steps = 1; frontier.length; steps++) {
    const next = []
    for (const arr of frontier) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const copy = [...arr]
          ;[copy[i], copy[j]] = [copy[j], copy[i]]
          const key = copy.join(',')
          if (key === goal) return steps
          if (!seen.has(key)) { seen.add(key); next.push(copy) }
        }
      }
    }
    frontier = next
  }
  throw new Error('unreachable')
}

function oracle(root) {
  const levels = []
  const walk = (node, depth) => {
    if (!node) return
    ;(levels[depth] ||= []).push(node.value)
    walk(node.left, depth + 1)
    walk(node.right, depth + 1)
  }
  walk(treeFromLevelOrder(root), 0)
  return levels.reduce((sum, values) => sum + minSwapsBrute(values), 0)
}

// Builds a valid level-order encoding: each queued node owns the next two slots.
function genTree(rnd, maxNodes, valueOf) {
  const arr = [valueOf()]
  const queue = [0]
  let nodes = 1
  for (let q = 0; q < queue.length; q++) {
    for (let s = 0; s < 2; s++) {
      if (nodes < maxNodes && rnd(3) > 0) { arr.push(valueOf()); queue.push(arr.length - 1); nodes++ } else arr.push(null)
    }
  }
  while (arr.length && arr[arr.length - 1] === null) arr.pop()
  return arr
}

test('2471 random trees match a permutation-search oracle', () => {
  let seed = 2471
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 50 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const root = genTree(rnd, 8, () => pool.pop())
    assert.equal(solve(root), oracle(root), JSON.stringify(root))
  }
})
