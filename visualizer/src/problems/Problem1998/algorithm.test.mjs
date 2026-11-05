import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

// Independent oracle: connect indices with gcd > 1, then each component must hold the same values as in sorted order.
function oracle(nums) {
  const n = nums.length
  const comp = nums.map((_, i) => i)
  const find = i => (comp[i] === i ? i : find(comp[i]))
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (gcd(nums[i], nums[j]) > 1) comp[find(i)] = find(j)
  const sorted = [...nums].sort((a, b) => a - b)
  const groups = new Map()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    if (!groups.has(r)) groups.set(r, { now: [], target: [] })
    groups.get(r).now.push(nums[i])
    groups.get(r).target.push(sorted[i])
  }
  return [...groups.values()].every(g => JSON.stringify(g.now.slice().sort((a, b) => a - b)) === JSON.stringify(g.target.slice().sort((a, b) => a - b)))
}

test('examples', () => {
  assert.equal(solve('[7,21,3]'), true)
  assert.equal(solve('[5,2,6,2]'), false)
  assert.equal(solve('[10,5,9,3,15]'), true)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[7,21,3]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random arrays match the component oracle', () => {
  let state = 163
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rand(8) }, () => 1 + rand(30))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
