import test from 'node:test'
import assert from 'node:assert/strict'
import { TracedHeap, describeHeapOps, heapHighlights, heapLayout, heapView, HEAP_VIEW_LIMIT } from './heapModel.js'

const isHeap = (a, cmp) => a.every((v, i) => i === 0 || cmp(a[(i - 1) >> 1], v) <= 0)

test('push and pop keep the heap order and return sorted output', () => {
  const heap = new TracedHeap((a, b) => a - b)
  const input = [5, 3, 8, 1, 9, 2, 7, 3]
  for (const v of input) { heap.push(v); assert.ok(isHeap(heap.data, heap.compare)) }
  const out = []
  while (heap.size) { out.push(heap.pop()); assert.ok(isHeap(heap.data, heap.compare)) }
  assert.deepEqual(out, [...input].sort((a, b) => a - b))
})

test('max order and tuple values', () => {
  const heap = new TracedHeap((a, b) => b[0] - a[0], { order: 'max' })
  ;[[2, 'a'], [9, 'b'], [4, 'c']].forEach(v => heap.push(v))
  assert.deepEqual(heap.pop(), [9, 'b'])
  assert.deepEqual(heap.peek(), [4, 'c'])
})

test('push log records the sift-up swaps', () => {
  const heap = new TracedHeap()
  ;[4, 7, 9].forEach(v => heap.push(v))
  heap.takeOps()
  heap.push(2)
  const [op] = heap.takeOps()
  assert.equal(op.start, 3)
  assert.equal(op.end, 0)
  assert.equal(op.steps.filter(s => s.swap).length, 2)
  const [line] = describeHeapOps([op])
  assert.match(line, /push\(2\): append it at the end of the array, index 3\./)
  assert.match(line, /2 is smaller than its parent 7, so swap them \(sift-up to index 1\)/)
  assert.deepEqual(heap.data, [2, 4, 9, 7])
})

test('pop log records the moved item and sift-down path', () => {
  const heap = new TracedHeap()
  ;[1, 3, 2, 6, 5, 4].forEach(v => heap.push(v))
  heap.takeOps()
  assert.equal(heap.pop(), 1)
  const [op] = heap.takeOps()
  assert.equal(op.moved, '4')
  const [line] = describeHeapOps([op])
  assert.match(line, /remove the minimum 1 from the root\. Move the last item 4 to the root\./)
  assert.match(line, /the smaller child is 2, which is smaller than 4, so swap them/)
  assert.ok(isHeap(heap.data, heap.compare))
  assert.equal(heapHighlights([op])[op.end], 'moved')
})

test('pop of the last item and empty pop', () => {
  const heap = new TracedHeap()
  heap.push(3); heap.takeOps()
  heap.pop()
  assert.match(describeHeapOps(heap.takeOps())[0], /heap is now empty/)
  assert.equal(heap.pop(), undefined)
})

test('heapView drains ops and hides oversized heaps', () => {
  const heap = new TracedHeap()
  heap.push([3, 'x']); heap.push([1, 'y'])
  const view = heapView(heap, { title: 'Queue' })
  assert.deepEqual(view.heap.items, ['1,y', '3,x'])
  assert.equal(view.heap.ops.length, 2)
  assert.equal(heapView(heap).heap.ops.length, 0)
  for (let i = 0; i <= HEAP_VIEW_LIMIT; i++) heap.push([i])
  assert.deepEqual(heapView(heap), {})
})

test('layout places children under parents', () => {
  const nodes = heapLayout(7)
  assert.deepEqual(nodes.map(n => n.depth), [0, 1, 1, 2, 2, 2, 2])
  assert.equal(nodes[0].x, 2)
  assert.ok(Math.abs(nodes[1].x - (nodes[3].x + nodes[4].x) / 2) < 1e-9)
  assert.equal(nodes[5].parent, 2)
})
