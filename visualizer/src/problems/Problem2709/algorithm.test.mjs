import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result
const PY = python.split('\n')

test('2709 worked examples', () => {
  assert.equal(solve([2, 3, 6]), true)
  assert.equal(solve([3, 9, 5]), false)
  assert.equal(solve([4, 3, 12, 8]), true)
  assert.equal(solve([7]), true)
})

test('2709 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [6, 10, 15] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2709 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Oracle: connect indices whose values share a factor greater than one, then check the graph is connected.
function oracle(nums) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const n = nums.length
  if (n === 1) return true
  const seen = new Array(n).fill(false)
  const stack = [0]
  seen[0] = true
  while (stack.length) {
    const u = stack.pop()
    for (let v = 0; v < n; v++) if (!seen[v] && gcd(nums[u], nums[v]) > 1) { seen[v] = true; stack.push(v) }
  }
  return seen.every(Boolean)
}

test('2709 random arrays match an oracle', () => {
  let seed = 2709
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(7)
    const nums = Array.from({ length: n }, () => 1 + rnd(40))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
