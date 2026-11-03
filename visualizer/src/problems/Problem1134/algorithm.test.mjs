import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

function digitsOf(n) {
  let x = n
  const out = []
  while (x > 0) { out.unshift(x % 10); x = Math.floor(x / 10) }
  return out
}

test('1134 hand-checked cases', () => {
  assert.equal(solve(153), true)
  assert.equal(solve(10), false)
  assert.equal(solve(1), true)
  assert.equal(solve(9474), true)
  assert.equal(solve(100), false)
})

test('1134 agrees with an arithmetic oracle for every n up to 20000', () => {
  for (let n = 1; n <= 20000; n++) {
    const ds = digitsOf(n)
    const k = ds.length
    let sum = 0
    for (const d of ds) sum += d ** k
    assert.equal(solve(n), sum === n, `n=${n}`)
  }
})

test('1134 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ n: 371 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.total, 371)
})

test('1134 parser rejects bad input', () => {
  assert.throws(() => parseInput('{"m":5}'))
  assert.throws(() => parseInput({ n: 0 }))
  assert.throws(() => parseInput({ n: 100000001 }))
  assert.throws(() => parseInput({ n: 2.5 }))
})
