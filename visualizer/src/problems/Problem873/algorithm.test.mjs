import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (a) => buildTrace(parseInput(JSON.stringify(a)))
function brute(arr) {
  const n = arr.length; let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const s = []; for (let i = 0; i < n; i++) if (mask >> i & 1) s.push(arr[i])
    if (s.length < 3 || s.length <= best) continue
    let ok = true; for (let i = 2; i < s.length; i++) if (s[i] !== s[i - 1] + s[i - 2]) { ok = false; break }
    if (ok) best = s.length
  }
  return best
}

test('official examples', () => {
  assert.equal(run([1, 2, 3, 4, 5, 6, 7, 8]).result, 5)
  assert.equal(run([1, 3, 7, 11, 12, 14, 18]).result, 3)
})

test('random vs subset enumeration', () => {
  for (let t = 0; t < 300; t++) {
    const pool = [...Array(30).keys()].map((x) => x + 1).sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 8)).sort((a, b) => a - b)
    const out = run(pool)
    assert.equal(out.result, brute(pool), JSON.stringify(pool))
    assert.equal(out.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('?'))
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[3,2,1]'), /increasing/)
  assert.throws(() => parseInput('[1,2,"3"]'))
})
