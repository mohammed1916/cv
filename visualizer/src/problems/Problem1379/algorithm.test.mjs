import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: breadth-first search with explicit path strings over a separately built structure.
function attached(root) {
  // Level-order positions: the children of the k-th live entry follow in order.
  const entries = []
  let cursor = 0
  const pending = [{ path: '' }]
  for (let i = 0; i < pending.length; i++) {
    const item = pending[i]
    if (cursor >= root.length) break
    const value = root[cursor++]
    if (value === null) continue
    entries.push({ value, path: item.path })
    pending.push({ path: item.path + 'L' }, { path: item.path + 'R' })
  }
  return entries
}

function oracle({ root, target }) {
  return attached(root).find(e => e.value === target).path
}

test('1379 official example shapes', () => {
  assert.equal(solve({ root: [7, 4, 3, null, null, 6, 19], target: 3 }), 'R')
  assert.equal(solve({ root: [7], target: 7 }), '')
  assert.equal(solve({ root: [8, null, 6, null, 5, null, 4, null, 3, null, 2, null, 1], target: 4 }), 'RRR')
})

test('1379 the target can sit deep on the left', () => {
  assert.equal(solve({ root: [1, 2, 3, 4, 5], target: 5 }), 'LR')
})

test('1379 rejects bad input', () => {
  assert.throws(() => parseInput('{"root":[1,1],"target":1}'))
  assert.throws(() => parseInput('{"root":[1,2],"target":3}'))
  assert.throws(() => parseInput('{"root":[1,2],"target":0}'))
})

test('1379 random trees match a breadth-first path oracle', () => {
  let seed = 1379
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 12 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const root = [pool[0]]
    const count = 1 + rnd(11)
    for (let i = 1; i < count; i++) root.push(rnd(4) === 0 ? null : pool[i])
    const entries = attached(root)
    const target = entries[rnd(entries.length)].value
    assert.equal(solve({ root, target }), oracle({ root, target }), JSON.stringify({ root, target }))
  }
})
