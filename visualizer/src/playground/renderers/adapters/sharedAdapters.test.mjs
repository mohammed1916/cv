import test from 'node:test'
import assert from 'node:assert/strict'
import { sequenceSharedKind, toPointerRailProps, toIndexedSequenceProps, toStackOperationProps } from './sequenceAdapter.js'
import { isCountsContainer, toFrequencyCountProps } from './countsAdapter.js'
import { splitRangeGroup } from './rangeAdapter.js'

const list = {
  id: 'nums', name: 'nums', category: 'sequence', type: 'array',
  items: [
    { id: 'a', value: 2, state: null },
    { id: 'b', value: 5, state: 'active' },
    { id: 'c', value: 9, state: 'changed' },
  ],
  pointers: [{ id: 'p-i', label: 'i', index: 1, state: 'pointer' }, { id: 'p-bad', label: 'j', index: 7 }],
}

test('list with an index pointer routes to PointerRail with valid pointers only', () => {
  assert.equal(sequenceSharedKind(list), 'pointer-rail')
  const props = toPointerRailProps(list)
  assert.deepEqual(props.values, ['2', '5', '9'])
  assert.deepEqual(props.pointers.map((p) => [p.label, p.index]), [['i', 1]])
  assert.deepEqual(props.highlight, [2])
  assert.equal(props.title, 'nums')
})

test('list without pointers routes to IndexedSequence', () => {
  const plain = { ...list, pointers: [] }
  assert.equal(sequenceSharedKind(plain), 'indexed-sequence')
  const props = toIndexedSequenceProps(plain)
  assert.equal(props.length, 3)
  assert.equal(props.active, 1)
  assert.equal(props.valueAt(2), '9')
  assert.equal(props.roleAt(2), 'changed')
})

test('a string container uses the same sequence mapping', () => {
  const text = { ...list, type: 'string', items: [{ value: 'a' }, { value: 'b' }], pointers: [] }
  assert.equal(sequenceSharedKind(text), 'indexed-sequence')
})

test('stack routes to StackOperationView and takes popped values from the container', () => {
  const stack = { id: 's', name: 'st', category: 'sequence', type: 'stack', items: [{ value: 1 }, { value: 4 }], pointers: [],
    popped: [{ name: 'top', value: 7 }, { name: 'bad' }, null] }
  assert.equal(sequenceSharedKind(stack), 'stack')
  const props = toStackOperationProps(stack)
  assert.deepEqual(props.items, ['1', '4'])
  assert.deepEqual(props.popped, [{ name: 'top', value: '7' }])
  assert.deepEqual(toStackOperationProps({ type: 'stack', items: [] }).popped, [])
})

test('dictionary with numeric values routes to FrequencyCountTable', () => {
  const counts = { id: 'c', name: 'freq', category: 'associative', type: 'map',
    entries: [{ id: 'e1', key: 'a', value: 2 }, { id: 'e2', key: 'b', value: 3, state: 'changed' }] }
  assert.equal(isCountsContainer(counts), true)
  assert.deepEqual(toFrequencyCountProps(counts), { title: 'freq', entries: [['a', 2], ['b', 3]], active: 'b' })
})

test('non-numeric map and sets keep the generic renderer', () => {
  const words = { category: 'associative', type: 'map', entries: [{ key: 'a', value: 'x' }] }
  assert.equal(isCountsContainer(words), false)
  assert.equal(toFrequencyCountProps(words), null)
  assert.equal(isCountsContainer({ category: 'associative', type: 'set', entries: [{ key: 'a', value: 1 }] }), false)
})

test('unknown sequence type falls back (no shared mapping)', () => {
  assert.equal(sequenceSharedKind({ category: 'sequence', type: 'queue', items: [], pointers: [] }), null)
  assert.equal(sequenceSharedKind({ category: 'sequence', type: 'deque', items: [], pointers: [] }), null)
})

test('low/high/mid scalars are grouped into AnswerRangeBar props', () => {
  const scalar = (name, value) => ({ id: name, name, category: 'scalar', type: 'number', value })
  const containers = [scalar('low', 2), scalar('high', 10), scalar('mid', 6), scalar('other', 1), list]
  const { rangeProps, rest } = splitRangeGroup(containers)
  assert.deepEqual(rangeProps, { title: 'Answer search', min: 2, max: 10, low: 2, high: 10, probe: 6 })
  assert.deepEqual(rest.map((c) => c.name), ['other', 'nums'])
})

test('a lone low without high is not a range group', () => {
  const containers = [{ name: 'low', category: 'scalar', type: 'number', value: 1 }]
  assert.equal(splitRangeGroup(containers).rangeProps, null)
  assert.equal(splitRangeGroup(containers).rest, containers)
})
