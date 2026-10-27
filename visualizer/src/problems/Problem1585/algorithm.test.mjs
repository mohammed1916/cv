import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace(parseInput(JSON.stringify({ s, t }))).result

test('1585 official examples', () => {
  assert.equal(solve('84532', '34852'), true)
  assert.equal(solve('34521', '23415'), true)
  assert.equal(solve('12345', '12435'), false)
})

test('1585 a smaller digit before a larger one cannot move past it', () => {
  // The 1 sits before the 3, and sorting can only move digits within a substring that includes it.
  assert.equal(solve('31', '13'), true)
  assert.equal(solve('13', '31'), false)
})

test('1585 rejects a non-digit character', () => {
  assert.throws(() => parseInput(JSON.stringify({ s: '1a', t: '1a' })))
})

// Independent oracle: breadth-first search over every string reachable by sorting substrings.
function reachable(s) {
  const seen = new Set([s])
  const queue = [s]
  while (queue.length) {
    const cur = queue.shift()
    for (let i = 0; i < cur.length; i++) {
      for (let j = i + 1; j <= cur.length; j++) {
        const next = cur.slice(0, i) + [...cur.slice(i, j)].sort().join('') + cur.slice(j)
        if (!seen.has(next)) { seen.add(next); queue.push(next) }
      }
    }
  }
  return seen
}

test('1585 random strings match a search over all sorting operations', () => {
  let seed = 1585
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const len = 1 + rnd(6)
    const s = Array.from({ length: len }, () => String(rnd(10))).join('')
    const options = [...reachable(s)]
    const t = trial % 2 === 0 ? options[rnd(options.length)] : Array.from({ length: len }, () => String(rnd(10))).join('')
    assert.equal(solve(s, t), reachable(s).has(t), `${s} -> ${t}`)
  }
})
