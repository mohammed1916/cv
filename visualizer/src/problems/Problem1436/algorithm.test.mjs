import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: the one city that is never the start of a road.
function oracle(paths) {
  const starts = new Set(paths.map(([from]) => from))
  return paths.map(([, to]) => to).find(city => !starts.has(city))
}

test('three-leg chain ends at the last arrival city', () => {
  const paths = [['Lima', 'Oslo'], ['Oslo', 'Quito'], ['Quito', 'Rome']]
  assert.equal(buildTrace(paths).result, 'Rome')
})

test('the destination can be reached through a branching order of roads', () => {
  const paths = [['A', 'B'], ['C', 'A'], ['B', 'D']]
  assert.equal(buildTrace(paths).result, 'D')
})

test('a single road has its arrival city as the destination', () => {
  assert.equal(buildTrace([['Tokyo', 'Kyiv']]).result, 'Kyiv')
})

test('matches the oracle on generated chains', () => {
  for (let n = 1; n <= 12; n++) {
    const cities = Array.from({ length: n + 1 }, (_, i) => `city${(i * 7) % 13}`)
    const paths = cities.slice(0, -1).map((c, i) => [c, cities[i + 1]])
    // Shuffle the road order so the first road is not always the chain start.
    const shuffled = [...paths].reverse()
    assert.equal(buildTrace(shuffled).result, oracle(shuffled))
  }
})

test('every frame names a phase and a line that exists in the code', () => {
  const { frames } = buildTrace([['X', 'Y'], ['Y', 'Z']])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
    assert.equal(typeof frame.message, 'string')
    assert.ok('snapshot' in frame)
  }
  assert.equal(frames.at(-1).snapshot.answer, 'Z')
})

test('python listing and pseudocode share the same numbered lines', () => {
  assert.equal(code.length, python.split('\n').length)
  assert.match(python, /def destination_city/)
})

test('parseInput rejects malformed roads and multiple endpoints', () => {
  assert.throws(() => parseInput('[["A"]]'), /pair/)
  assert.throws(() => parseInput('[["A","B"],["C","D"]]'), /exactly one/)
  assert.deepEqual(parseInput('[["A","B"]]'), [['A', 'B']])
})
