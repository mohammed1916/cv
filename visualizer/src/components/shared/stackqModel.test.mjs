import test from 'node:test'
import assert from 'node:assert/strict'
import { StackqLog, describeStackqOps, stackqView } from './stackqModel.js'
import { definitions } from '../../problems/families/collectionStories/definitions.js'
import { definitions as scan } from '../../problems/families/scanStories/definitions.js'

test('stack operations are logged with where they happen and why', () => {
  const log = new StackqLog(), stack = log.lane('stack', 'stack')
  stack.push(3, 'first value.'); stack.push(5, 'second value.')
  assert.equal(stack.peek(), 5)
  stack.keep('top stays.')
  assert.equal(stack.pop('it is dominated.'), 5)
  assert.deepEqual(describeStackqOps(log.takeOps()), [
    'push 3 onto the top of stack. First value.', 'push 5 onto the top of stack. Second value.',
    'keep 5, the top of stack. Top stays.', 'pop 5 off the top of stack. It is dominated.'])
})

test('deque has both ends and queue uses enqueue/dequeue', () => {
  const log = new StackqLog(), deque = log.lane('window (index)', 'deque'), queue = log.lane('line', 'queue')
  deque.push(1, 'a.'); deque.push(2, 'b.'); deque.pushFront(0, 'c.')
  assert.deepEqual(deque.items, [0, 1, 2])
  assert.equal(deque.popFront('expired.'), 0)
  assert.equal(deque.pop('dominated.'), 2)
  queue.push('x', 'arrives.'); queue.push('y', 'arrives.'); queue.popFront('served.')
  const lines = describeStackqOps(log.takeOps())
  assert.ok(lines.includes('pop 0 off the front of window. Expired.'))
  assert.ok(lines.includes('pop 2 off the back of window. Dominated.'))
  assert.ok(lines.includes('enqueue x at the back of line. Arrives.'))
  assert.ok(lines.includes('dequeue x from the front of line. Served.'))
})

test('stackqView drains the log, marks new and removed items, and hides oversized lanes', () => {
  const log = new StackqLog(), s = log.lane('s', 'stack')
  s.push(1, 'x.'); s.push(2, 'y.'); stackqView(log)
  s.pop('z.'); s.push(9, 'w.')
  const { stackq } = stackqView(log)
  assert.deepEqual(stackq.lanes[0].items.map(i => [i.label, i.fresh]), [['1', false], ['9', true]])
  assert.deepEqual(stackq.lanes[0].removed, [{ label: '2', end: 'back' }])
  assert.equal(stackqView(log).stackq.ops.length, 0)
  for (let i = 0; i < 30; i++) s.push(i, '.')
  assert.deepEqual(stackqView(log), {})
})

test('popping an empty lane logs nothing and returns undefined', () => {
  const log = new StackqLog(), s = log.lane('s', 'stack')
  assert.equal(s.pop('x'), undefined); assert.equal(s.popFront('x'), undefined)
  assert.equal(log.takeOps().length, 0)
})

test('story solvers emit a stackq view whose lane matches the logged operations', () => {
  for (const [defs, ids] of [[definitions, [901, 946, 1438, 1696, 2454]], [scan, [735, 844]]]) {
    for (const id of ids) {
      const d = defs[id], frames = d.build(d.parse(d.examples[0].input)).frames
      const withView = frames.filter(f => f.stackq)
      assert.ok(withView.length > 0, `${id} has no stackq frames`)
      assert.ok(withView.some(f => f.stackq.ops.some(op => op.type === 'push')), `${id} never shows a push`)
      assert.ok(withView.every(f => describeStackqOps(f.stackq.ops).every(line => line.length > 12)))
    }
  }
})
