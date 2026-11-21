import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, CODE_LINES } from './algorithm.js'
import { sizeTutorial } from './tutorial.js'

const solve = (parent, s) => buildTrace({ parent, s }).result

test('3331 worked examples and pasted cases', () => {
  assert.deepEqual(solve([-1, 0, 1], 'aba'), [3, 1, 1])
  assert.deepEqual(solve([-1, 0, 0, 1, 1, 1], 'abaabc'), [6, 3, 1, 1, 1, 1])
  assert.deepEqual(solve([-1, 0, 0, 1, 1], 'abcde'), [5, 3, 1, 1, 1])
  // Every node has the same letter, so each node's nearest same-letter ancestor is its parent: the chain stays intact.
  assert.deepEqual(solve([-1, 0, 1, 2, 3], 'aaaaa'), [5, 4, 3, 2, 1])
  assert.deepEqual(solve([-1, 0, 1, 2, 0], 'abaca'), [5, 1, 2, 1, 1])
  assert.deepEqual(solve([-1, 0, 0, 0, 0], 'aaaaa'), [5, 1, 1, 1, 1])
  assert.deepEqual(solve([-1], 'a'), [1])
})

test('3331 rejects a parent that is not an earlier node', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,0],"s":"abc"}'))
})

// Independent oracle: rebuild the new tree explicitly, then count each node's subtree by walking every node up to the root.
function oracle(parent, s) {
  const n = parent.length
  const newParent = Array(n).fill(-1)
  for (let x = 1; x < n; x++) {
    const chain = []
    for (let y = parent[x]; y !== -1; y = parent[y]) chain.push(y)
    const same = chain.find(y => s[y] === s[x])
    newParent[x] = same === undefined ? parent[x] : same
  }
  const sizes = Array(n).fill(0)
  for (let v = 0; v < n; v++) {
    for (let y = v; y !== -1; y = newParent[y]) sizes[y]++
  }
  return sizes
}

test('3331 random trees match an explicit re-parenting oracle', () => {
  let seed = 3331
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.deepEqual(solve(parent, s), oracle(parent, s), JSON.stringify({ parent, s }))
  }
})

test('3331 every frame points at a real code line and the result is the last frame', () => {
  const run = buildTrace({ parent: [-1, 0, 1, 1, 0], s: 'abaca' })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= CODE_LINES.length)
    assert.ok(frame.message.length > 0)
    const scene = sizeTutorial({ run, step: frame })
    assert.ok(scene.reason.length > 20)
    assert.ok(Object.values(scene.variables).every(v => v !== undefined && !String(v).includes('undefined')))
  }
  assert.deepEqual(run.frames.at(-1).sizes, run.result)
  assert.match(run.frames.at(-1).message, /Subtree sizes/)
})
