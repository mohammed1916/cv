import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (o) => buildTrace(parseInput(JSON.stringify(o)))
function brute(richer, quiet) {
  const n = quiet.length
  const r = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j))
  for (const [a, b] of richer) r[a][b] = true
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r[i][k] && r[k][j]) r[i][j] = true
  return quiet.map((_, x) => { let best = x; for (let y = 0; y < n; y++) if (r[y][x] && quiet[y] < quiet[best]) best = y; return best })
}

test('official examples', () => {
  assert.deepEqual(run({ richer: [[1, 0], [2, 1], [3, 1], [3, 7], [4, 3], [5, 3], [6, 3]], quiet: [3, 2, 5, 4, 6, 1, 7, 0] }).result, [5, 5, 2, 5, 4, 5, 6, 7])
  assert.deepEqual(run({ richer: [], quiet: [0] }).result, [0])
})

test('random vs transitive-closure brute force', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 9)
    const perm = [...Array(n).keys()].sort(() => Math.random() - 0.5)
    const quiet = [...Array(n).keys()].sort(() => Math.random() - 0.5)
    const richer = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.random() < 0.3) richer.push([perm[i], perm[j]])
    const out = run({ richer, quiet })
    assert.deepEqual(out.result, brute(richer, quiet))
    assert.equal(out.frames[0].phase, 'start')
    assert.equal(out.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('nope'))
  assert.throws(() => parseInput('{"richer":[[0,1],[1,0]],"quiet":[1,0]}'), /consistent/)
  assert.throws(() => parseInput('{"richer":[],"quiet":[1,1]}'), /distinct/)
  assert.throws(() => parseInput('{"richer":[[0,5]],"quiet":[1,0]}'))
})
