import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: enumerate every perfect matching of the points and keep the non-crossing ones.
function oracle(n) {
  let count = 0
  function crosses(a, b, c, d) {
    const [p, q] = a < b ? [a, b] : [b, a]
    const [r, s] = c < d ? [c, d] : [d, c]
    return (p < r && r < q && q < s) || (r < p && p < s && s < q)
  }
  function match(free, pairs) {
    if (free.length === 0) {
      for (let x = 0; x < pairs.length; x += 1) {
        for (let y = x + 1; y < pairs.length; y += 1) {
          if (crosses(...pairs[x], ...pairs[y])) return
        }
      }
      count += 1
      return
    }
    const [first, ...rest] = free
    for (let k = 0; k < rest.length; k += 1) {
      const partner = rest[k]
      match(rest.filter((_, idx) => idx !== k), [...pairs, [first, partner]])
    }
  }
  match(Array.from({ length: n }, (_, k) => k), [])
  return count
}

test('four people have 2 non-crossing handshake patterns', () => {
  const run = buildTrace(parseInput('4'))
  assert.equal(run.result, 2)
  assertFrameInvariants(run)
})

test('six people have 5 non-crossing patterns, the Catalan number', () => {
  assert.equal(buildTrace(parseInput('6')).result, 5)
})

test('two people have exactly one pattern', () => {
  assert.equal(buildTrace(parseInput('2')).result, 1)
})

test('parseInput rejects odd or out-of-range counts', () => {
  assert.throws(() => parseInput('5'), /even integer/)
  assert.throws(() => parseInput('0'), /from 2 to 20/)
  assert.throws(() => parseInput('22'), /from 2 to 20/)
})

test('the trace agrees with the enumerate-all-matchings oracle for small even n', () => {
  for (let n = 2; n <= 10; n += 2) {
    const run = buildTrace(parseInput(String(n)))
    assert.equal(run.result, oracle(n), `n ${n}`)
    assertFrameInvariants(run)
  }
})

test('the modulus applies for larger n without overflow', () => {
  // Catalan(10) = 16796 for n = 20; the result stays below the modulus.
  assert.equal(buildTrace(parseInput('20')).result, 16796)
})
