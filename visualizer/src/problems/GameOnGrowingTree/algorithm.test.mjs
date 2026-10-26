import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Reference: the solver this visualizer was built from, kept verbatim for comparison.
function insertTop3(first, second, third, idx, value) {
  if (value > first[idx]) { third[idx] = second[idx]; second[idx] = first[idx]; first[idx] = value; return 1 }
  if (value > second[idx]) { third[idx] = second[idx]; second[idx] = value; return 2 }
  if (value > third[idx]) { third[idx] = value; return 3 }
  return 0
}
function referenceScore(parent, size) {
  const first = new Array(size).fill(0), second = new Array(size).fill(0), third = new Array(size).fill(0)
  for (let node = size - 1; node >= 1; node -= 1) insertTop3(first, second, third, parent[node], second[node] + 1)
  for (let node = 1; node < size; node += 1) {
    const p = parent[node]
    const depth = second[p] <= second[node] + 1 ? third[p] + 1 : second[p] + 1
    insertTop3(first, second, third, node, depth)
  }
  let best = 0
  for (let i = 0; i < size; i += 1) if (second[i] > best) best = second[i]
  return best + 1
}
function referenceAnswers(parentValues) {
  return parentValues.map((_, k) => {
    const parent = [0, ...parentValues.slice(0, k + 1).map(v => v - 1)]
    return referenceScore(parent, k + 2)
  })
}

test('sample from the statement gives 1 2 2 2 2 2 2 3 3', () => {
  assert.deepEqual(buildTrace([1, 1, 3, 3, 1, 2, 1, 2, 8]).result, [1, 2, 2, 2, 2, 2, 2, 3, 3])
})

test('chain and star examples agree with the reference solver', () => {
  for (const values of [[1, 2, 3, 4, 5, 6, 7, 8], [1, 1, 1, 1, 1, 1, 1, 1]]) {
    assert.deepEqual(buildTrace(values).result, referenceAnswers(values))
  }
})

test('random growing trees agree with the reference solver after every query', () => {
  let state = 9
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const q = 1 + rand(12)
    const parents = Array.from({ length: q }, (_, i) => 1 + rand(i + 1))
    assert.deepEqual(buildTrace(parents).result, referenceAnswers(parents), JSON.stringify(parents))
  }
})

test('every frame has a chapter, narration, and a code line inside the solver', () => {
  const run = buildTrace([1, 1, 3, 3, 1, 2, 1, 2, 8])
  for (const frame of run.frames) {
    assert.ok(frame.chapter && frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 21)
  }
  assert.equal(run.frames.at(-1).chapter, 'Result')
})

test('each query finishes with a score frame, and the scores accumulate', () => {
  const run = buildTrace([1, 2, 3])
  const scores = run.frames.filter(f => f.chapter.endsWith('· score')).map(f => f.scene.scoreOfQuery)
  assert.deepEqual(scores, run.result)
})

test('invalid parents are rejected with a readable message', () => {
  assert.throws(() => parseInput('[2]'), /Query 1/)
  assert.throws(() => parseInput('[1,1,4]'), /Query 3/)
  assert.throws(() => parseInput('[]'))
})
