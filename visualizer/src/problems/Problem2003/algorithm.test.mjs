import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: for every node, gather its subtree by walking each node's ancestor chain.
function oracle(parents, nums) {
  const n = parents.length
  return Array.from({ length: n }, (_, u) => {
    const inSub = v => { for (let x = v; x !== -1; x = parents[x]) if (x === u) return true; return false }
    const values = new Set()
    for (let v = 0; v < n; v++) if (inSub(v)) values.add(nums[v])
    let m = 1
    while (values.has(m)) m++
    return m
  })
}

test('examples', () => {
  assert.deepEqual(solve('{"parents":[-1,0,0,2],"nums":[1,2,3,4]}'), [5, 1, 1, 1])
  assert.deepEqual(solve('{"parents":[-1,0,1,0,3,3],"nums":[5,4,6,2,1,3]}'), [7, 1, 1, 4, 2, 1])
  assert.deepEqual(solve('{"parents":[-1,0],"nums":[2,3]}'), [1, 1])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"parents":[-1,0],"nums":[1,2]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random trees match the subtree oracle', () => {
  let state = 197
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(10)
    const parents = [-1, ...Array.from({ length: n - 1 }, (_, i) => rand(i + 1))]
    const pool = Array.from({ length: 12 }, (_, i) => i + 1)
    const nums = []
    for (let i = 0; i < n; i++) nums.push(pool.splice(rand(pool.length), 1)[0])
    assert.deepEqual(solve(JSON.stringify({ parents, nums })), oracle(parents, nums), JSON.stringify({ parents, nums }))
  }
})
