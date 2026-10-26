import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('715 official-style example', () => {
  assert.deepEqual(buildTrace([['addRange', 10, 20], ['removeRange', 14, 15], ['queryRange', 10, 14], ['queryRange', 13, 16], ['queryRange', 16, 17]]).result, [true, false, true])
})

// Oracle: a bitmap of unit cells 0–49; a range is covered when every unit inside it is set.
test('715 random operations match a unit-cell bitmap', () => {
  let state = 181
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = []
    for (let i = 0; i < 1 + rand(15); i++) {
      const l = rand(40), r = l + 1 + rand(10)
      ops.push([['addRange', 'removeRange', 'queryRange'][rand(3)], l, r])
    }
    const cells = Array(51).fill(false)
    const expected = []
    for (const [name, l, r] of ops) {
      if (name === 'addRange') for (let c = l; c < r; c++) cells[c] = true
      else if (name === 'removeRange') for (let c = l; c < r; c++) cells[c] = false
      else { let all = true; for (let c = l; c < r; c++) if (!cells[c]) all = false; expected.push(all) }
    }
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('715 rejects empty or reversed ranges', () => {
  assert.throws(() => parseInput('[["addRange",5,5]]'))
})
