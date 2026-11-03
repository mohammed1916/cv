import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const winner = values => buildTrace(values).result

// Oracle: plain minimax recursion over the number of stones the mover takes.
function bruteForce(values) {
  const n = values.length
  const f = i => {
    if (i >= n) return 0
    let best = -Infinity
    let sum = 0
    for (let k = 1; k <= 3 && i + k - 1 < n; k++) {
      sum += values[i + k - 1]
      best = Math.max(best, sum - f(i + k))
    }
    return best
  }
  const d = f(0)
  return d > 0 ? 'Alice' : d < 0 ? 'Bob' : 'Tie'
}

test('sample [4, -1, 6] is an Alice win', () => {
  assert.equal(winner([4, -1, 6]), 'Alice')
})

test('a single zero stone is a tie', () => {
  assert.equal(winner([0]), 'Tie')
})

test('a single negative stone is forced on Alice, so Bob wins', () => {
  assert.equal(winner([-5]), 'Bob')
  assert.equal(bruteForce([-5]), 'Bob')
})

test('random stone rows match minimax', () => {
  let seed = 47
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(10) }, () => rnd(21) - 10)
    assert.equal(winner(values), bruteForce(values), JSON.stringify(values))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[51]'))
  assert.throws(() => parseInput('"abc"'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace([4, -1, 6])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'decide')
})
