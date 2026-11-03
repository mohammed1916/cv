import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle: compare every pair of dominoes directly, allowing a turn.
function oracle(dominoes) {
  let total = 0
  for (let i = 0; i < dominoes.length; i++) {
    for (let j = i + 1; j < dominoes.length; j++) {
      const [a, b] = dominoes[i], [c, d] = dominoes[j]
      if ((a === c && b === d) || (a === d && b === c)) total++
    }
  }
  return total
}

test('own samples count turned matches', () => {
  assert.equal(buildTrace([[1, 2], [2, 1], [3, 4], [1, 2]]).result, 3)
  assert.equal(buildTrace([[5, 5]]).result, 0)
  assert.equal(buildTrace([[4, 4], [4, 4], [4, 4]]).result, 3)
  assert.equal(buildTrace([[1, 2], [3, 4], [5, 6]]).result, 0)
})

test('random domino lists agree with the pairwise oracle', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const dominoes = Array.from({ length: 1 + rand(40) }, () => [1 + rand(9), 1 + rand(9)])
    assert.equal(buildTrace(dominoes).result, oracle(dominoes), JSON.stringify(dominoes))
  }
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([[1, 2], [2, 1]])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 5)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[[1,10]]'), /1 to 9/)
  assert.throws(() => parseInput('[[1,2,3]]'), /pair/)
  assert.throws(() => parseInput('[]'), /1 to 40/)
})
