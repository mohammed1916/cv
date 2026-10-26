import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (sx, sy, tx, ty) => buildTrace(parseInput(JSON.stringify({ sx, sy, tx, ty })))
test('official examples', () => {
  assert.equal(run(1, 1, 3, 5).result, true)
  assert.equal(run(1, 1, 2, 2).result, false)
  assert.equal(run(1, 1, 1, 1).result, true)
})
test('matches forward search for small coordinates', () => {
  const LIM = 30
  for (let sx = 1; sx <= 6; sx++) for (let sy = 1; sy <= 6; sy++) {
    const seen = new Set([`${sx},${sy}`])
    const q = [[sx, sy]]
    while (q.length) {
      const [x, y] = q.pop()
      for (const [a, b] of [[x + y, y], [x, x + y]]) if (a <= LIM && b <= LIM && !seen.has(`${a},${b}`)) { seen.add(`${a},${b}`); q.push([a, b]) }
    }
    for (let tx = 1; tx <= LIM; tx++) for (let ty = 1; ty <= LIM; ty++) {
      const r = run(sx, sy, tx, ty)
      assert.equal(r.result, seen.has(`${tx},${ty}`), `${sx},${sy} -> ${tx},${ty}`)
      assert.equal(r.frames.at(-1).phase, 'done')
    }
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"sx":0,"sy":1,"tx":1,"ty":1}'))
  assert.throws(() => parseInput('{"sx":1}'))
  assert.throws(() => parseInput('[1,1,1,1]'))
})
