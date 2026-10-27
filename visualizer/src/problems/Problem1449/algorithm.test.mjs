import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1449 official examples', () => {
  assert.equal(solve('{"cost":[4,3,2,5,6,7,2,5,5],"target":9}'), '7772')
  assert.equal(solve('{"cost":[7,6,5,5,5,6,8,7,8],"target":12}'), '85')
  assert.equal(solve('{"cost":[2,4,6,2,4,6,4,4,4],"target":5}'), '0')
})

test('1449 prefers more digits, then the larger digit at the front', () => {
  // Cost 1 for digit 1 and cost 2 for digit 9: target 4 gives 1111 (4 digits) rather than 99 (2 digits).
  assert.equal(solve('{"cost":[1,9,9,9,9,9,9,9,2],"target":4}'), '1111')
  // Digit 9 costs 1 and digit 1 costs 1 too: the largest digit comes first.
  assert.equal(solve('{"cost":[1,1,1,1,1,1,1,1,1],"target":3}'), '999')
})

test('1449 rejects a cost that is not between 1 and 9', () => {
  assert.throws(() => parseInput('{"cost":[1,1,1,1,1,1,1,1,10],"target":3}'))
  assert.throws(() => parseInput('{"cost":[1,1,1],"target":3}'))
})

// Independent oracle: recursion keeps the best string (longest, then largest) for each remaining cost.
function oracle({ cost, target }) {
  const memo = new Map()
  const best = rem => {
    if (rem === 0) return ''
    if (memo.has(rem)) return memo.get(rem)
    let answer = null
    for (let d = 1; d <= 9; d++) {
      const c = cost[d - 1]
      if (c > rem) continue
      const tail = best(rem - c)
      if (tail === null) continue
      const candidate = String(d) + tail
      if (answer === null || candidate.length > answer.length || (candidate.length === answer.length && candidate > answer)) answer = candidate
    }
    memo.set(rem, answer)
    return answer
  }
  return best(target) ?? '0'
}

test('1449 random costs match a recursion oracle', () => {
  let seed = 1449
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cost = Array.from({ length: 9 }, () => 1 + rnd(9))
    const target = 1 + rnd(15)
    const input = { cost, target }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
