import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle: sort with explicit ranks. Listed values get their arr2 position,
// unlisted values come after all listed values and are ordered numerically.
function oracle(arr1, arr2) {
  const rank = new Map(arr2.map((v, i) => [v, i]))
  const key = v => (rank.has(v) ? [0, rank.get(v)] : [1, v])
  return [...arr1].sort((a, b) => {
    const [ka, kb] = [key(a), key(b)]
    return ka[0] !== kb[0] ? ka[0] - kb[0] : ka[1] - kb[1]
  })
}

test('own samples follow the listed order and then sort the rest', () => {
  assert.deepEqual(buildTrace({ arr1: [4, 2, 9, 2, 7, 4, 1], arr2: [2, 4, 1] }).result, [2, 2, 4, 4, 1, 7, 9])
  assert.deepEqual(buildTrace({ arr1: [5, 5, 5], arr2: [5] }).result, [5, 5, 5])
  assert.deepEqual(buildTrace({ arr1: [8, 3, 6], arr2: [3] }).result, [3, 6, 8])
})

test('random arrays agree with the rank-based oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr1 = Array.from({ length: 1 + rand(25) }, () => rand(31))
    const distinct = [...new Set(arr1)]
    const pick = distinct.filter(() => rand(2) === 0)
    const arr2 = pick.length ? pick : [distinct[0]]
    assert.deepEqual(buildTrace({ arr1, arr2 }).result, oracle(arr1, arr2), JSON.stringify({ arr1, arr2 }))
  }
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ arr1: [3, 1, 3, 2], arr2: [3, 2] })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 5)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"arr1":[1,2],"arr2":[3]}'), /appear in arr1/)
  assert.throws(() => parseInput('{"arr1":[1,2],"arr2":[1,1]}'), /distinct/)
  assert.throws(() => parseInput('{"arr1":[31],"arr2":[31]}'), /0 to 30/)
})
