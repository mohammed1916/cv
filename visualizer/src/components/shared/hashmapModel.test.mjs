import test from 'node:test'
import assert from 'node:assert/strict'
import { TrackedMap, TrackedSet, describeHashOps, hashEntryRoles, hashmapView, limitHashEntries } from './hashmapModel.js'

test('a tracked map behaves like a Map and logs hit, miss, insert, update and delete', () => {
  const seen = new TrackedMap('seen', { keyLabel: 'value', valueLabel: 'index' })
  assert.equal(seen.get(2), undefined)
  seen.set(2, 0)
  seen.set(2, 5)
  assert.equal(seen.has(2), true)
  assert.equal(seen.delete(2), true)
  assert.equal(seen.delete(2), false)
  assert.equal(seen.size, 0)
  const { hash } = hashmapView(seen)
  assert.deepEqual(hash.ops.map(op => op.type), ['lookup', 'insert', 'update', 'lookup', 'delete', 'delete'])
  const lines = describeHashOps(hash.ops)
  assert.deepEqual(lines.map(line => line.kind), ['miss', 'insert', 'update', 'hit', 'delete', 'miss'])
  assert.match(lines[0].text, /MISS/)
  assert.match(lines[2].text, /0 is replaced by 5/)
  assert.deepEqual(hashmapView(seen).hash.ops, []) // ops are consumed once
})

test('has(k) followed by get(k) is one logged lookup', () => {
  const m = new TrackedMap('m')
  m.set('a', 1)
  hashmapView(m)
  if (m.has('a')) m.get('a')
  assert.equal(hashmapView(m).hash.ops.length, 1)
})

test('a tracked set logs membership checks and redundant adds; entries snapshot in order', () => {
  const s = new TrackedSet('visited')
  s.add(3); s.add(3); s.has(9)
  const { hash } = hashmapView(s)
  assert.deepEqual(describeHashOps(hash.ops).map(l => l.kind), ['insert', 'hit', 'miss'])
  assert.deepEqual(hash.maps[0].entries, [[3]])
  assert.equal(hash.maps[0].isSet, true)
})

test('roles keep the last operation per key, and long maps are capped', () => {
  const m = new TrackedMap('m')
  m.get('x'); m.set('x', 1)
  assert.deepEqual(hashEntryRoles(hashmapView(m).hash.ops), { x: 'insert' })
  const many = Array.from({ length: 50 }, (_, i) => [i, i])
  assert.equal(limitHashEntries(many).shown.length, 40)
  assert.equal(limitHashEntries(many).hidden, 10)
})

test('frames stay serialisable and spreading the view does not mutate the structure', () => {
  const m = new TrackedMap('m')
  m.set([1, 2].join(), 7)
  const view = hashmapView(m)
  assert.doesNotThrow(() => JSON.stringify(view))
  assert.equal(m.get('1,2'), 7)
})
