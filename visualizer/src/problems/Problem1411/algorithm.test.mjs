import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: enumerate all 3^3 rows, keep the valid ones, and count compatible
// neighbours by brute force on the 12 valid rows (no ABA/ABC classification).
const MOD = 1000000007n
function reference(n) {
  const rows = []
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    if (a !== b && b !== c) rows.push([a, b, c])
  }
  const ok = (r, s) => r.every((v, i) => v !== s[i])
  let ways = rows.map(() => 1n)
  for (let step = 1; step < n; step++) {
    ways = rows.map((_, j) => rows.reduce((sum, _r, i) => (ok(rows[i], rows[j]) ? (sum + ways[i]) % MOD : sum), 0n))
  }
  return Number(ways.reduce((sum, w) => (sum + w) % MOD, 0n))
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 0)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('one and two rows give 12 and 54 colorings', () => {
  assert.equal(buildTrace(1).result, 12)
  assert.equal(buildTrace(2).result, 54)
})

test('small row counts agree with the brute-force oracle', () => {
  for (let n = 1; n <= 12; n++) assert.equal(buildTrace(n).result, reference(n), `n=${n}`)
})

test('large row counts agree with the oracle under the modulus', () => {
  for (const n of [30, 60, 5000]) assert.equal(buildTrace(n).result, reference(n), `n=${n}`)
})

test('every frame is well formed', () => {
  checkFrames(buildTrace(4))
})

test('parser enforces the trace limit', () => {
  assert.equal(parseInput('3'), 3)
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('61'))
  assert.throws(() => parseInput('2.5'))
})
