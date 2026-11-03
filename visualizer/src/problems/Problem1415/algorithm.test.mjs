import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: enumerate every string over a, b, c in lexicographic order and keep
// those with no equal neighbours. The k-th survivor is the answer.
function enumerateHappy(n) {
  const out = []
  const walk = s => {
    if (s.length === n) { out.push(s); return }
    for (const c of 'abc') if (!s || s.at(-1) !== c) walk(s + c)
  }
  walk('')
  return out
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

test('rank 4 of length 3 is acb', () => {
  assert.equal(buildTrace({ n: 3, k: 4 }).result, 'acb')
})

test('the first and last happy strings', () => {
  assert.equal(buildTrace({ n: 3, k: 1 }).result, 'aba')
  assert.equal(buildTrace({ n: 3, k: 12 }).result, 'cbc')
})

test('a rank beyond the last string gives an empty string', () => {
  assert.equal(buildTrace({ n: 2, k: 7 }).result, '')
  assert.equal(buildTrace({ n: 1, k: 4 }).result, '')
})

test('every rank for lengths 1 to 7 agrees with full enumeration', () => {
  for (let n = 1; n <= 7; n++) {
    const all = enumerateHappy(n)
    for (let k = 1; k <= all.length + 1; k++) {
      const expected = k <= all.length ? all[k - 1] : ''
      assert.equal(buildTrace({ n, k }).result, expected, `n=${n} k=${k}`)
    }
  }
})

test('every frame is well formed', () => {
  checkFrames(buildTrace({ n: 3, k: 4 }))
  checkFrames(buildTrace({ n: 2, k: 9 }))
})

test('parser checks both numbers', () => {
  assert.deepEqual(parseInput('3 4'), { n: 3, k: 4 })
  assert.throws(() => parseInput('3'))
  assert.throws(() => parseInput('0 1'))
  assert.throws(() => parseInput('11 1'))
  assert.throws(() => parseInput('3 201'))
})
