import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('710 remapping sends every draw to an allowed value, bijectively', () => {
  let state = 141
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rand(12)
    const blacklist = [...new Set(Array.from({ length: rand(n - 1) }, () => rand(n)))]
    const m = n - blacklist.length
    const draws = Array.from({ length: m }, (_, i) => i)
    const allowed = new Set(Array.from({ length: n }, (_, i) => i).filter(v => !blacklist.includes(v)))
    const picks = buildTrace({ n, blacklist, draws }).result
    assert.ok(picks.every(p => allowed.has(p)), JSON.stringify({ n, blacklist }))
    assert.equal(new Set(picks).size, m, 'every allowed value is reachable exactly once')
  }
})

test('710 official-style example', () => {
  assert.deepEqual(buildTrace({ n: 4, blacklist: [2], draws: [0, 1, 2] }).result, [0, 1, 3])
})

test('710 rejects draws outside the reduced range', () => {
  assert.throws(() => parseInput('{"n":4,"blacklist":[2],"draws":[3]}'))
})
