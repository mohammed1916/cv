import test from 'node:test'
import assert from 'node:assert/strict'
import { describeTrieOps, trieWalkCells, trieNodeRoles, trieChildren } from './trieModel.js'

const ops = [
  { kind: 'reuse', char: 'f', parentPrefix: '', prefix: 'f', node: 1 },
  { kind: 'create', char: 'o', parentPrefix: 'f', prefix: 'fo', node: 2 },
  { kind: 'miss', char: 'x', parentPrefix: 'fo', prefix: 'fox' },
  { kind: 'end', prefix: 'fo' },
]

test('describes created, reused, missing and end-of-word operations', () => {
  const lines = describeTrieOps(ops)
  assert.equal(lines.length, 4)
  assert.match(lines[0], /REUSED/)
  assert.match(lines[0], /the root/)
  assert.match(lines[1], /NEW node .* 'fo'/)
  assert.match(lines[2], /walk stops/)
  assert.match(lines[3], /End of word/)
})

test('walk cells keep order and skip non-walk operations', () => {
  assert.deepEqual(trieWalkCells(ops).map(c => c.status), ['reused', 'created', 'missing'])
  assert.deepEqual(trieWalkCells(ops).map(c => c.char), ['f', 'o', 'x'])
})

test('node roles mark created over reused', () => {
  assert.deepEqual(trieNodeRoles(ops), { 1: 'reused', 2: 'created' })
  assert.deepEqual(trieNodeRoles([{ kind: 'create', node: 3 }, { kind: 'reuse', node: 3 }]), { 3: 'created' })
})

test('children lookup', () => {
  const kids = trieChildren([{ id: 0, parent: null }, { id: 1, parent: 0 }, { id: 2, parent: 0 }])
  assert.deepEqual(kids.get(0), [1, 2])
})
