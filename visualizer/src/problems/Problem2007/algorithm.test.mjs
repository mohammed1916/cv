import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every half-size subset of the changed array.
function hasOriginal(changed) {
  const n = changed.length
  if (n % 2) return false
  const want = [...changed].sort((a, b) => a - b).join(',')
  for (let m = 0; m < 1 << n; m++) {
    const picked = []
    for (let i = 0; i < n; i++) if (m & (1 << i)) picked.push(changed[i])
    if (picked.length !== n / 2) continue
    const doubled = [...picked, ...picked.map(v => 2 * v)].sort((a, b) => a - b).join(',')
    if (doubled === want) return true
  }
  return false
}

test('examples', () => {
  const r = solve('[1,3,4,2,6,8]')
  assert.deepEqual([...r].sort((a, b) => a - b), [1, 3, 4])
  assert.deepEqual(solve('[6,3,0,1]'), [])
  assert.deepEqual(solve('[1]'), [])
  assert.deepEqual(solve('[0,0,0,0]'), [0, 0])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[1,2,4,8]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays agree with the subset oracle and return valid doublings', () => {
  let state = 223
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(8)
    const changed = Array.from({ length: n }, () => rand(9))
    const result = solve(JSON.stringify(changed))
    if (result.length) {
      const doubled = [...result, ...result.map(v => 2 * v)].sort((a, b) => a - b).join(',')
      assert.equal(doubled, [...changed].sort((a, b) => a - b).join(','), JSON.stringify(changed))
    } else {
      assert.equal(hasOriginal(changed), false, JSON.stringify(changed))
    }
  }
})
