import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = p => buildTrace(parseInput(JSON.stringify(p))).result

test('2375 official examples', () => {
  assert.equal(solve('IIIDIDDD'), '123549876')
  assert.equal(solve('DDD'), '4321')
  assert.equal(solve('I'), '12')
})

test('2375 rejects characters other than I and D', () => {
  assert.throws(() => parseInput('"IXD"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: try permutations of 1 to n + 1 in increasing order and return the first that matches.
function oracle(p) {
  const digits = Array.from({ length: p.length + 1 }, (_, i) => i + 1)
  const perms = []
  const build = (prefix, rest) => {
    if (rest.length === 0) { perms.push(prefix); return }
    for (const d of rest) build([...prefix, d], rest.filter(x => x !== d))
  }
  build([], digits)
  for (const perm of perms) {
    let ok = true
    for (let i = 0; i < p.length && ok; i++) if ((p[i] === 'I') !== (perm[i] < perm[i + 1])) ok = false
    if (ok) return perm.join('')
  }
  return null
}

test('2375 random patterns match a brute-force permutation oracle', () => {
  let seed = 2375
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    let p = ''
    const len = 1 + rnd(6)
    for (let i = 0; i < len; i++) p += rnd(2) ? 'I' : 'D'
    assert.equal(solve(p), oracle(p), p)
  }
})
