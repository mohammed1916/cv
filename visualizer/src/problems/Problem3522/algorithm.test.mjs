import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3522 worked examples', () => {
  assert.equal(solve('{"instructions":["jump","add","add","jump","add","jump"],"values":[2,1,3,1,-2,-3]}'), 1)
  assert.equal(solve('{"instructions":["add","jump","add","add"],"values":[3,-2,5,1]}'), 3)
})

test('3522 rejects an unknown instruction', () => {
  assert.throws(() => parseInput('{"instructions":["skip"],"values":[1]}'))
})

// Independent oracle: first list the indices the walk visits (in order), then sum the adds among them.
function oracle({ instructions, values }) {
  const path = []
  const seen = new Array(instructions.length).fill(false)
  let i = 0
  while (i >= 0 && i < instructions.length && !seen[i]) {
    seen[i] = true
    path.push(i)
    i = instructions[i] === 'add' ? i + 1 : i + values[i]
  }
  return path.filter(p => instructions[p] === 'add').reduce((sum, p) => sum + values[p], 0)
}

test('3522 seeded random cases match a path-then-sum oracle', () => {
  let seed = 3522
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const input = {
      instructions: Array.from({ length: n }, () => (rnd(2) ? 'add' : 'jump')),
      values: Array.from({ length: n }, () => rnd(11) - 5),
    }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
