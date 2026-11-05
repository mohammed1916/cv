import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: count array membership for every value 1..100.
function oracle(a, b, c) {
  const out = []
  for (let v = 1; v <= 100; v++) {
    const k = [a, b, c].filter(arr => arr.includes(v)).length
    if (k >= 2) out.push(v)
  }
  return out
}

test('examples', () => {
  assert.deepEqual(solve('{"nums1":[1,1,3,2],"nums2":[2,3],"nums3":[3]}').slice().sort((x, y) => x - y), [2, 3])
  assert.deepEqual(solve('{"nums1":[3,1],"nums2":[2,3],"nums3":[1,2]}').slice().sort((x, y) => x - y), [1, 2, 3])
  assert.deepEqual(solve('{"nums1":[1],"nums2":[2],"nums3":[3]}'), [])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"nums1":[1],"nums2":[1],"nums3":[2]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the membership oracle', () => {
  let state = 457
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  const arr = () => Array.from({ length: 1 + rand(12) }, () => 1 + rand(30))
  for (let t = 0; t < 150; t++) {
    const a = arr(), b = arr(), c = arr()
    const got = solve(JSON.stringify({ nums1: a, nums2: b, nums3: c })).slice().sort((x, y) => x - y)
    assert.deepEqual(got, oracle(a, b, c), JSON.stringify({ a, b, c }))
  }
})
