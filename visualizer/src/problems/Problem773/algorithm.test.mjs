import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, NEIGHBORS } from './algorithm.js'

const run = b => buildTrace(parseInput(JSON.stringify(b)))
const toBoard = s => [[...s.slice(0, 3)].map(Number), [...s.slice(3)].map(Number)]
test('official examples', () => {
  assert.equal(run([[1, 2, 3], [4, 0, 5]]).result, 1)
  assert.equal(run([[1, 2, 3], [5, 4, 0]]).result, -1)
  assert.equal(run([[4, 1, 2], [5, 0, 3]]).result, 5)
})
function perms(a) { return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])) }
test('parity solvability on all 720 boards, and iterative-deepening distances', () => {
  const idd = (s, depth, prev) => {
    if (s === '123450') return true
    if (depth === 0) return false
    const z = s.indexOf('0')
    for (const j of NEIGHBORS[z]) {
      if (j === prev) continue
      const t = [...s]; [t[z], t[j]] = [t[j], t[z]]
      if (idd(t.join(''), depth - 1, z)) return true
    }
    return false
  }
  let sampled = 0
  for (const p of perms([0, 1, 2, 3, 4, 5])) {
    const s = p.join('')
    const tiles = p.filter(x => x !== 0)
    let inv = 0
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (tiles[i] > tiles[j]) inv++
    const r = run(toBoard(s)).result
    if (inv % 2 === 1) assert.equal(r, -1, s)
    else {
      assert.ok(r >= 0, s)
      if (sampled++ % 12 === 0) {
        assert.ok(idd(s, r, -1), `reachable in ${r}: ${s}`)
        if (r > 0) assert.ok(!idd(s, r - 1, -1), `not in ${r - 1}: ${s}`)
      }
    }
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,2,3],[4,5,5]]'))
  assert.throws(() => parseInput('[[1,2],[3,4],[5,0]]'))
  assert.throws(() => parseInput('3'))
})
