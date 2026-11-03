import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = words => buildTrace(words).result

// Oracle: keep each word that is inside some other word of the list.
const bruteForce = words => words.filter((w, i) => words.some((o, j) => i !== j && o.includes(w)))

test('sample ["mass", "as", "hero", "superhero"] keeps "as" and "hero"', () => {
  assert.deepEqual(solve(['mass', 'as', 'hero', 'superhero']), ['as', 'hero'])
})

test('no word inside another gives an empty answer', () => {
  assert.deepEqual(solve(['cat', 'dog']), [])
})

test('random distinct word lists match the oracle', () => {
  let seed = 59
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  const letters = 'abc'
  for (let t = 0; t < 300; t++) {
    const pool = new Set()
    const target = 1 + rnd(8)
    while (pool.size < target) {
      pool.add(Array.from({ length: 1 + rnd(4) }, () => letters[rnd(3)]).join(''))
    }
    const words = [...pool]
    assert.deepEqual(solve(words), bruteForce(words), JSON.stringify(words))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('["ab", "ab"]'))
  assert.throws(() => parseInput('["Ab"]'))
  assert.throws(() => parseInput('[]'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace(['mass', 'as', 'hero', 'superhero'])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
