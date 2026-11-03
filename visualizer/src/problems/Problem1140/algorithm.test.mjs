import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: a memoised recursion written directly from the rules of the game.
function reference(piles) {
  const n = piles.length
  const memo = new Map()
  const take = (i, M) => {
    if (i >= n) return 0
    const key = `${i},${M}`
    if (memo.has(key)) return memo.get(key)
    let total = 0
    for (let k = i; k < n; k++) total += piles[k]
    let best = 0
    for (let X = 1; X <= Math.min(2 * M, n - i); X++) {
      let taken = 0
      for (let k = i; k < i + X; k++) taken += piles[k]
      const opponent = take(i + X, Math.max(M, X))
      best = Math.max(best, taken + (total - taken - opponent))
    }
    memo.set(key, best)
    return best
  }
  return take(0, 1)
}

function randomPiles(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const n = 1 + rand(8)
  return Array.from({ length: n }, () => 1 + rand(20))
}

test('examples and random piles agree with the recursive reference', () => {
  for (const example of examples) {
    const piles = parseInput(example.input)
    assert.equal(buildTrace(piles).result, reference(piles), example.label)
  }
  for (let seed = 1; seed <= 200; seed++) {
    const piles = randomPiles(seed)
    assert.equal(buildTrace(piles).result, reference(piles), JSON.stringify(piles))
  }
})

test('a single pile is taken whole', () => {
  assert.equal(buildTrace([7]).result, 7)
})

test('every frame has a declared phase, a valid code line, narration and a snapshot', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const run = buildTrace(parseInput(examples[0].input))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid piles are rejected with a readable message', () => {
  assert.throws(() => parseInput('[0,3]'), /Pile 1/)
  assert.throws(() => parseInput('[]'), /1 to 10/)
})
