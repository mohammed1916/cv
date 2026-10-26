import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (start, end) => buildTrace(parseInput(JSON.stringify({ start, end })))
function reachable(start) {
  const seen = new Set([start])
  const q = [start]
  while (q.length) {
    const s = q.pop()
    for (let i = 0; i + 1 < s.length; i++) {
      const pair = s.slice(i, i + 2)
      const t = pair === 'XL' ? 'LX' : pair === 'RX' ? 'XR' : null
      if (!t) continue
      const next = s.slice(0, i) + t + s.slice(i + 2)
      if (!seen.has(next)) { seen.add(next); q.push(next) }
    }
  }
  return seen
}
test('official examples', () => {
  assert.equal(run('RXXLRXRXL', 'XRLXXRRLX').result, true)
  assert.equal(run('X', 'L').result, false)
})
test('matches BFS over all swaps for every pair of strings up to length 5', () => {
  const all = n => (n === 0 ? [''] : all(n - 1).flatMap(s => ['L', 'R', 'X'].map(c => s + c)))
  for (let n = 1; n <= 5; n++) {
    const strings = all(n)
    for (const a of strings) {
      const reach = reachable(a)
      for (const b of strings) {
        const r = run(a, b)
        assert.equal(r.result, reach.has(b), `${a} -> ${b}`)
        assert.equal(r.frames.at(-1).phase, 'done')
      }
    }
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"start":"LR","end":"L"}'))
  assert.throws(() => parseInput('{"start":"AB","end":"AB"}'))
  assert.throws(() => parseInput('[]'))
})
