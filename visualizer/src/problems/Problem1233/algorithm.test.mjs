import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = folder => buildTrace(parseInput(JSON.stringify({ folder }))).result
const sorted = list => [...list].sort()

test('1233 worked examples', () => {
  assert.deepEqual(sorted(solve(['/a', '/a/b/c', '/a/b/d'])), ['/a'])
  assert.deepEqual(sorted(solve(['/a', '/b/c', '/c/d', '/c/f'])), ['/a', '/b/c', '/c/d', '/c/f'])
  assert.deepEqual(sorted(solve(['/a/b/c', '/a/b/ca', '/a/b/d'])), ['/a/b/c', '/a/b/ca', '/a/b/d'])
})

test('1233 rejects duplicates and malformed paths', () => {
  assert.throws(() => parseInput('{"folder":["/a","/a"]}'))
  assert.throws(() => parseInput('{"folder":["a/b"]}'))
})

// Independent oracle: drop a path when some other path is a proper ancestor of it.
function oracle(folder) {
  return folder.filter(f => !folder.some(g => g !== f && f.startsWith(g + '/')))
}

test('1233 random inputs match an ancestor-check oracle', () => {
  let seed = 1233
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const paths = new Set()
    const count = 1 + rnd(8)
    while (paths.size < count) {
      const depth = 1 + rnd(3)
      paths.add('/' + Array.from({ length: depth }, () => 'ab'[rnd(2)]).join('/'))
    }
    const folder = [...paths]
    assert.deepEqual(sorted(solve(folder)), sorted(oracle(folder)), JSON.stringify(folder))
  }
})
