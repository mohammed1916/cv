import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (tree, targets) => buildTrace(parseInput(JSON.stringify({ tree, targets }))).result

test('1261 worked examples', () => {
  // A root with only a right child: the right child is 2, so 1 is absent and 2 is present.
  assert.deepEqual(solve([-1, null, -1], [1, 2]), [false, true])
  // A full tree of five positions recovers 0 to 4; 5 is not in it.
  assert.deepEqual(solve([-1, -1, -1, -1, -1], [1, 3, 5]), [true, true, false])
})

test('1261 rejects a value other than -1', () => {
  assert.throws(() => parseInput('{"tree":[-1,0],"targets":[1]}'))
})

// Independent oracle: a target t sits at the position whose path follows the bits of t + 1 after its leading 1.
function oracleAnswers(tree, targets) {
  const root = treeFromLevelOrderLocal(tree)
  return targets.map(t => {
    let cur = root
    for (const bit of (t + 1).toString(2).slice(1)) {
      cur = cur === null ? null : bit === '0' ? cur.left : cur.right
      if (cur === null) return false
    }
    return cur !== null
  })
}

function treeFromLevelOrderLocal(arr) {
  if (!arr.length || arr[0] === null) return null
  const make = () => ({ left: null, right: null })
  const root = make()
  const queue = [root]
  let cursor = 1
  for (let q = 0; q < queue.length; q++) {
    if (cursor < arr.length && arr[cursor] !== null) { queue[q].left = make(); queue.push(queue[q].left) }
    cursor++
    if (cursor < arr.length && arr[cursor] !== null) { queue[q].right = make(); queue.push(queue[q].right) }
    cursor++
  }
  return root
}

// Builds a random tree with exactly count nodes by splitting the remaining count between the two children.
function grow(count, rnd) {
  if (count === 0) return null
  const rest = count - 1
  const leftCount = rnd(rest + 1)
  return { left: grow(leftCount, rnd), right: grow(rest - leftCount, rnd) }
}

function toLevelOrder(root) {
  const out = []
  const queue = [root]
  while (queue.length) {
    const n = queue.shift()
    if (n === null) { out.push(null); continue }
    out.push(-1)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1261 random trees match a bit-path oracle', () => {
  let seed = 1261
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const shape = grow(1 + rnd(12), rnd)
    const tree = toLevelOrder(shape)
    const targets = Array.from({ length: 1 + rnd(8) }, () => rnd(40))
    assert.deepEqual(solve(tree, targets), oracleAnswers(tree, targets), JSON.stringify({ tree, targets }))
  }
})
