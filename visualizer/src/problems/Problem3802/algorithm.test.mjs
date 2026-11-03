import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, limitA, limitB) => buildTrace({ n, limitA, limitB }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: enumerate every colouring of n sheets with colours 0 and 1.
function oracle(n, limitA, limitB) {
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const colours = Array.from({ length: n }, (_, i) => (mask >> i) & 1)
    const runs = colours.filter((c, i) => i === 0 || colours[i - 1] !== c).length
    if (runs !== 2) continue
    const zeros = colours.filter(c => c === 0).length
    const ones = n - zeros
    if (zeros <= limitA && ones <= limitB) count++
  }
  return count
}

test('3802 worked case: three sheets, both limits two', () => {
  assert.equal(solve(3, 2, 2), 4)
})

test('3802 a limit of one forces both colours to one sheet', () => {
  assert.equal(solve(2, 1, 1), 2)
  assert.equal(solve(4, 1, 1), 0)
})

test('3802 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ n: 5, limitA: 3, limitB: 4 }))
})

test('3802 parseInput rejects out-of-range limits', () => {
  assert.throws(() => parseInput('{"n":5,"limitA":0,"limitB":2}'))
  assert.throws(() => parseInput('{"n":5,"limitA":2,"limitB":6}'))
})

test('3802 matches the exhaustive colouring oracle', () => {
  for (let n = 2; n <= 9; n++) {
    for (let a = 1; a <= n; a++) {
      for (let b = 1; b <= n; b++) {
        assert.equal(solve(n, a, b), oracle(n, a, b), JSON.stringify({ n, a, b }))
      }
    }
  }
})
