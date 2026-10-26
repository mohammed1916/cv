import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('707 official example results', () => {
  const run = buildTrace([['addAtHead', 1], ['addAtTail', 3], ['addAtIndex', 1, 2], ['get', 1], ['deleteAtIndex', 0], ['get', 0]])
  assert.deepEqual(run.result, [2, 2])
})

test('707 random operations match a JavaScript array oracle', () => {
  let state = 151
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = []
    const arr = []
    const expected = []
    for (let i = 0; i < 1 + rand(15); i++) {
      const choice = rand(5)
      const v = rand(50)
      if (choice === 0) { ops.push(['addAtHead', v]); arr.unshift(v) }
      else if (choice === 1) { ops.push(['addAtTail', v]); arr.push(v) }
      else if (choice === 2) { const idx = rand(arr.length + 2); ops.push(['addAtIndex', idx, v]); if (idx >= 0 && idx <= arr.length) arr.splice(idx, 0, v) }
      else if (choice === 3) { const idx = rand(arr.length + 2); ops.push(['deleteAtIndex', idx]); if (idx >= 0 && idx < arr.length) arr.splice(idx, 1) }
      else { const idx = rand(arr.length + 2); ops.push(['get', idx]); expected.push(idx < arr.length ? arr[idx] : -1) }
    }
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('707 rejects unknown operations', () => {
  assert.throws(() => parseInput('[["pop",1]]'))
})
