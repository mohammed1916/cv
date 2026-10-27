import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3187 official examples', () => {
  assert.deepEqual(solve('{"nums":[3,1,4,2,5],"queries":[[2,2,4],[1,0,2],[1,0,4]]}'), [0, 1])
  assert.deepEqual(solve('{"nums":[4,1,4,2,1,5],"queries":[[2,2,4],[1,0,2],[1,0,5]]}'), [0, 1])
})

test('3187 the first and last positions are never peaks', () => {
  assert.deepEqual(solve('{"nums":[9,1,9],"queries":[[1,0,2]]}'), [0])
})

test('3187 rejects an update value out of range', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"queries":[[2,0,21]]}'))
})

// Independent oracle: apply each update to a plain array and scan the range for peaks directly.
function oracle({ nums, queries }) {
  const arr = nums.slice()
  const out = []
  for (const [kind, a, b] of queries) {
    if (kind === 2) { arr[a] = b; continue }
    let count = 0
    for (let i = a + 1; i < b; i++) if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) count++
    out.push(count)
  }
  return out
}

test('3187 random arrays and queries match a direct scan', () => {
  let seed = 3187
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(9))
    const queries = []
    for (let k = 1 + rnd(7); k > 0; k--) {
      if (rnd(2)) { const l = rnd(n); queries.push([1, l, l + rnd(n - l)]) } else queries.push([2, rnd(n), 1 + rnd(9)])
    }
    const input = { nums, queries }
    assert.deepEqual(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
