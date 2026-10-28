import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3223 official examples', () => {
  assert.equal(solve('abaacbcbb'), 5)
  assert.equal(solve('aa'), 2)
})

test('3223 an odd count can drop to one, an even count to two', () => {
  assert.equal(solve('aaa'), 1)
  assert.equal(solve('aaaa'), 2)
  assert.equal(solve('a'), 1)
})

test('3223 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"aA"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('5'))
})

// Independent oracle: literally apply the operation until no index qualifies.
// Pick index i when a same letter exists on its left and on its right, then delete
// the nearest such letter on each side (index i itself stays).
function oracle(s) {
  const t = s.split('')
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < t.length; i++) {
      const left = t.slice(0, i).lastIndexOf(t[i])
      const right = t.slice(i + 1).indexOf(t[i])
      if (left >= 0 && right >= 0) {
        t.splice(i + 1 + right, 1)
        t.splice(left, 1)
        changed = true
        break
      }
    }
  }
  return t.length
}

test('3223 random strings match a simulation oracle', () => {
  let seed = 3223
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(14)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
