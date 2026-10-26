import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (s, k) => buildTrace(parseInput(JSON.stringify([s, k])))

function decode(s) {
  let out = ''
  for (const c of s) out = /[2-9]/.test(c) ? out.repeat(Number(c)) : out + c
  return out
}

test('official examples', () => {
  assert.equal(run('leet2code3', 10).result, 'o')
  assert.equal(run('ha22', 5).result, 'h')
  assert.equal(run('a2345678999999999999999', 1).result, 'a')
})

test('matches full expansion for every index of random strings', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(7)
    let s = String.fromCharCode(97 + rnd(26))
    for (let i = 1; i < len; i++) s += rnd(3) === 0 ? String(2 + rnd(3)) : String.fromCharCode(97 + rnd(26))
    const full = decode(s)
    if (full.length > 5000) continue
    for (let k = 1; k <= full.length; k++) {
      const trace = run(s, k)
      assert.equal(trace.result, full[k - 1], `${s} ${k}`)
      assert.equal(trace.frames.at(-1).phase, 'done')
    }
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('["2a", 1]'))
  assert.throws(() => parseInput('["ab", 3]'))
  assert.throws(() => parseInput('["aB", 1]'))
  assert.throws(() => parseInput('["ab", 0]'))
  assert.throws(() => parseInput('"ab"'))
})
