import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: collect nodes depth by depth with a depth-first walk (not a queue), then link neighbours in each row.
// Returns one entry per node in the order the nodes were created by the level-order reader (BFS order of the tree).
function oracle(root, order) {
  const rows = []
  const walk = (node, depth) => {
    if (!node) return
    if (!rows[depth]) rows[depth] = []
    rows[depth].push(node)
    walk(node.left, depth + 1)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  const next = new Map()
  for (const row of rows) row.forEach((node, i) => next.set(node, i + 1 < row.length ? row[i + 1] : null))
  return order.map(node => (next.get(node) ? next.get(node).value : null))
}

// Random tree with unique values, serialized in level order with null for missing children.
function randomCase(rand, maxNodes) {
  let counter = 0
  const root = { value: ++counter, left: null, right: null }
  const order = [root]
  const entries = [root.value]
  for (let head = 0; head < order.length; head++) {
    const node = order[head]
    for (const side of ['left', 'right']) {
      if (order.length < maxNodes && rand(3) > 0) {
        const child = { value: ++counter, left: null, right: null }
        node[side] = child
        order.push(child)
        entries.push(child.value)
      } else {
        entries.push(null)
      }
    }
  }
  return { entries, root, order }
}

test('sample [4,2,9,1,null,null,6,3] links the two middle rows', () => {
  assert.deepEqual(buildTrace('[4,2,9,1,null,null,6,3]').result, [null, 9, null, 6, null, null])
})

test('a single root has no neighbour, and a chain links nothing across levels', () => {
  assert.deepEqual(buildTrace('[7]').result, [null])
  assert.deepEqual(buildTrace('[1,2,null,3]').result, [null, null, null])
})

test('a missing middle child still links across the gap', () => {
  // Root 5 has children 3 and 8; 3 has only a left child 1; 8 has only a right child 9.
  assert.deepEqual(buildTrace('[5,3,8,1,null,null,9]').result, [null, 8, null, 9, null])
})

test('random trees agree with the depth-first oracle', () => {
  let state = 31
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const { entries, root, order } = randomCase(rand, 1 + rand(15))
    assert.deepEqual(buildTrace(entries).result, oracle(root, order), JSON.stringify(entries))
  }
})

test('frames use declared phases, finish with the result, and keep the queue as ids', () => {
  const run = buildTrace('[4,2,9,1,null,null,6,3]')
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8)
    assert.ok(Array.isArray(frame.snapshot.queue))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).snapshot.result, run.result)
  assert.deepEqual(run.input.levels, [[0], [1, 2], [3, 4], [5]])
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"root":[1]}'), /level order/)
  assert.throws(() => parseInput('[]'), /1-31 entries/)
  assert.throws(() => parseInput('[null,1]'), /root and cannot be null/)
  assert.throws(() => buildTrace('[1,null,null,5]'), /not attached/)
  assert.throws(() => parseInput('[1.5]'), /Entry 0 must be null/)
})
