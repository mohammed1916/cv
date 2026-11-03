import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every order of the pieces and compare the concatenation with arr.
function permutations(items) {
  if (items.length <= 1) return [items]
  return items.flatMap((item, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [item, ...rest]))
}
function oracle(arr, pieces) {
  return permutations(pieces).some(order => order.flat().join() === arr.join())
}

test('a hand-made case with a single-value piece forms the array', () => {
  const run = buildTrace(parseInput('{"arr":[5,7,9,2],"pieces":[[7,9],[5],[2]]}'))
  assert.equal(run.result, true)
})

test('an interleaved piece cannot be used, so the answer is false', () => {
  const run = buildTrace(parseInput('{"arr":[1,2,3],"pieces":[[1,3],[2]]}'))
  assert.equal(run.result, false)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('random splittings of arr into shuffled pieces are accepted, and the oracle agrees', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(7)
    const arr = []
    while (arr.length < n) { const v = rand(201) - 100; if (!arr.includes(v)) arr.push(v) }
    const pieces = []
    for (let i = 0; i < n;) {
      const len = 1 + rand(Math.min(3, n - i))
      pieces.push(arr.slice(i, i + len))
      i += len
    }
    for (let i = pieces.length - 1; i > 0; i--) { const j = rand(i + 1); [pieces[i], pieces[j]] = [pieces[j], pieces[i]] }
    const input = { arr, pieces }
    assert.equal(buildTrace(input).result, oracle(arr, pieces), JSON.stringify(input))
    assert.equal(buildTrace(input).result, true)
  }
})

test('random inputs with one swapped value agree with the oracle', () => {
  const cases = [
    { arr: [1, 2, 3, 4], pieces: [[2, 1], [3], [4]] },
    { arr: [1, 2, 3, 4], pieces: [[1, 2], [4, 3]] },
    { arr: [9, 8, 7], pieces: [[8], [9, 7]] },
  ]
  for (const input of cases) assert.equal(buildTrace(input).result, oracle(input.arr, input.pieces), JSON.stringify(input))
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"arr":[1,1],"pieces":[[1],[1]]}'))
  assert.throws(() => parseInput('{"arr":[1,2],"pieces":[[1]]}'))
  assert.throws(() => parseInput('{"arr":[1,2],"pieces":[[1],[3]]}'))
  assert.throws(() => parseInput('[1,2]'))
})
