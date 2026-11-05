import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const subsetSums = nums => nums.reduce((acc, v) => [...acc, ...acc.map(s => s + v)], [0]).sort((a, b) => a - b)
const sameMultiset = (a, b) => JSON.stringify([...a].sort((x, y) => x - y)) === JSON.stringify([...b].sort((x, y) => x - y))

test('examples recover some array with the given subset sums', () => {
  const cases = [[1, [0, 5]], [2, [-3, -2, -1, 0]], [3, [0, 0, 0, 0, 0, 0, 0, 0]]]
  for (const [n, sums] of cases) {
    const result = solve(JSON.stringify({ n, sums }))
    assert.equal(result.length, n)
    assert.ok(sameMultiset(subsetSums(result), sums))
  }
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"n":2,"sums":[0,1,2,3]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays are recovered up to subset-sum equality', () => {
  let state = 17
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rand(5)
    const nums = Array.from({ length: n }, () => rand(11) - 5)
    const sums = subsetSums(nums)
    const result = solve(JSON.stringify({ n, sums }))
    assert.ok(sameMultiset(subsetSums(result), sums), JSON.stringify({ nums, result }))
  }
})
