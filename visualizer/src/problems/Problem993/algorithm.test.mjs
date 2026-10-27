import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = text => buildTrace(parseInput(text)).result

test('993 official examples', () => {
  assert.equal(solve('{"arr":[1,2,3,4],"x":4,"y":3}'), false)
  assert.equal(solve('{"arr":[1,2,3,null,4,null,5],"x":5,"y":4}'), true)
  assert.equal(solve('{"arr":[1,2,3,null,4],"x":2,"y":3}'), false)
})

test('993 edge cases: siblings and different depths', () => {
  // Siblings share a parent, so they are not cousins.
  assert.equal(solve('{"arr":[1,2,3],"x":2,"y":3}'), false)
  // A root and its child sit at different depths.
  assert.equal(solve('{"arr":[1,2],"x":1,"y":2}'), false)
})

test('993 rejects bad input', () => {
  assert.throws(() => parseInput('{"arr":[1,2,3],"x":1,"y":9}'), /both be placed/)
  assert.throws(() => parseInput('{"arr":[1,null,null,3],"x":1,"y":3}'), /both be placed/)
  assert.throws(() => parseInput('{"arr":[1,2,2],"x":1,"y":2}'), /unique/)
  assert.throws(() => parseInput('{"arr":[1,2,3],"x":2,"y":2}'), /different/)
  assert.throws(() => parseInput('{"arr":[100,2],"x":2,"y":100}'), /0 to 99/)
})

// Independent oracle: a recursive walk that records (depth, parent) for every value in a Map.
function oracle(input) {
  const root = treeFromLevelOrder(input.arr)
  const info = new Map()
  const walk = (node, parent, depth) => {
    if (!node) return
    info.set(node.value, { parent, depth })
    walk(node.left, node.value, depth + 1)
    walk(node.right, node.value, depth + 1)
  }
  walk(root, null, 0)
  const a = info.get(input.x), b = info.get(input.y)
  return a.depth === b.depth && a.parent !== b.parent
}

test('993 random trees match a recursive depth-and-parent oracle', () => {
  let seed = 993
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const pool = Array.from({ length: 41 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const size = 2 + rnd(14)
    const arr = [pool[0]]
    for (let i = 1; i < size; i++) arr.push(rnd(4) === 0 ? null : pool[i])
    const placed = []
    const stack = [treeFromLevelOrder(arr)]
    while (stack.length) {
      const node = stack.pop()
      if (!node) continue
      placed.push(node.value)
      stack.push(node.left, node.right)
    }
    if (placed.length < 2) continue
    const x = placed[rnd(placed.length)]
    let y = placed[rnd(placed.length)]
    while (y === x) y = placed[rnd(placed.length)]
    const input = parseInput(JSON.stringify({ arr, x, y }))
    assert.equal(buildTrace(input).result, oracle(input), JSON.stringify({ arr, x, y }))
    checked++
  }
  assert.ok(checked > 200)
})
