import test from 'node:test'
import assert from 'node:assert/strict'
import { graphCircleLayout, graphNodeRole, isActiveEdge, edgesFromAdjacency, describeFrontier, frontierOps, colourName, degreeTags, colourTags, gridCellRole, cellName } from './graphTraversalModel.js'

test('layout puts every node inside the box', () => {
  const pts = graphCircleLayout(6, 400, 300)
  assert.equal(pts.length, 6)
  for (const p of pts) { assert.ok(p.x >= 0 && p.x <= 400 && p.y >= 0 && p.y <= 300) }
  assert.deepEqual(graphCircleLayout(1, 400, 300), [{ x: 200, y: 150 }])
})
test('node role priority', () => {
  const s = { current: 1, neighbour: 2, frontier: [2, 3], visited: [1, 2, 3, 4], done: [4] }
  assert.equal(graphNodeRole(1, s), 'current')
  assert.equal(graphNodeRole(2, s), 'neighbour')
  assert.equal(graphNodeRole(3, s), 'frontier')
  assert.equal(graphNodeRole(4, s), 'done')
  assert.equal(graphNodeRole(0, s), '')
  assert.equal(graphNodeRole(5, { visited: [5] }), 'visited')
})
test('active edge direction rules', () => {
  assert.ok(isActiveEdge(0, 1, { current: 1, neighbour: 0 }))
  assert.ok(!isActiveEdge(0, 1, { current: 1, neighbour: 0, directed: true }))
  assert.ok(isActiveEdge(1, 0, { current: 1, neighbour: 0, directed: true }))
  assert.ok(isActiveEdge(0, 1, { current: 1, neighbour: 0, directed: true, reversed: true }))
  assert.ok(!isActiveEdge(0, 1, { current: null, neighbour: 0 }))
})
test('adjacency to deduplicated edges', () => {
  assert.deepEqual(edgesFromAdjacency([[1, 2], [0], [0]]), [[0, 1], [0, 2]])
  assert.deepEqual(edgesFromAdjacency([[1], [0]], true), [[0, 1], [1, 0]])
})
test('frontier description', () => {
  assert.equal(describeFrontier('queue', [1, 2]), 'Queue (front first): 1, 2')
  assert.equal(describeFrontier('stack', []), 'Stack (top is last): empty')
})
test('queue ops: dequeue front then enqueue back', () => {
  assert.deepEqual(frontierOps([1, 2], [2, 3, 4], 'queue'), ['Dequeue 1 from the front of the queue.', 'Enqueue 3 at the back of the queue.', 'Enqueue 4 at the back of the queue.'])
  assert.deepEqual(frontierOps([], [5], 'queue'), ['Enqueue 5 at the back of the queue.'])
  assert.deepEqual(frontierOps([5], [5], 'queue'), [])
  assert.deepEqual(frontierOps([5], [], 'queue'), ['Dequeue 5 from the front of the queue.'])
})
test('stack ops: pop and push at top', () => {
  assert.deepEqual(frontierOps([0, 1, 2], [0, 1], 'stack'), ['Pop 2 off the stack.'])
  assert.deepEqual(frontierOps([0, 1], [0, 1, 3], 'stack'), ['Push 3 onto the stack.'])
  assert.deepEqual(frontierOps(undefined, [0], 'stack'), ['Push 0 onto the stack.'])
})
test('colour and degree tags', () => {
  assert.equal(colourName(0), 'A'); assert.equal(colourName(1), 'B'); assert.equal(colourName(-1), '?')
  assert.deepEqual(degreeTags([2, 0]), { 0: 'in 2', 1: 'in 0' })
  assert.deepEqual(colourTags([0, -1]), { 0: 'colour A', 1: 'colour ?' })
})
test('grid cell roles', () => {
  const s = { current: [1, 1], neighbour: [1, 2], frontier: [[2, 1]], visited: [[0, 0]], done: [[0, 1]] }
  assert.equal(gridCellRole(1, 1, s), 'current')
  assert.equal(gridCellRole(1, 2, s), 'neighbour')
  assert.equal(gridCellRole(2, 1, s), 'frontier')
  assert.equal(gridCellRole(0, 1, s), 'done')
  assert.equal(gridCellRole(0, 0, s), 'visited')
  assert.equal(gridCellRole(2, 2, s), '')
  assert.equal(cellName([3, 4]), '(3,4)')
})
