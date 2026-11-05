import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: full game-tree search over the remaining stones, the removed sum modulo 3 and whose turn it is.
function oracle(stones) {
  const n = stones.length
  const memo = new Map()
  // Returns true when the player to move (0 = Alice, 1 = Bob) wins.
  const win = (mask, sum, player) => {
    const key = `${mask},${sum},${player}`
    if (memo.has(key)) return memo.get(key)
    let result = false
    for (let i = 0; i < n && !result; i++) {
      if (!(mask & (1 << i))) continue
      const nextSum = (sum + stones[i]) % 3
      const nextMask = mask ^ (1 << i)
      if (nextSum === 0) continue // the mover loses
      if (nextMask === 0) { result = player === 1; continue } // Bob wins when no stones remain
      result = !win(nextMask, nextSum, 1 - player)
    }
    memo.set(key, result)
    return result
  }
  return win((1 << n) - 1, 0, 0)
}

test('examples', () => {
  assert.equal(solve('[2,1]'), true)
  assert.equal(solve('[2]'), false)
  assert.equal(solve('[3,3,3]'), false)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[2,1]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random stone sets match the game-tree oracle', () => {
  let state = 397
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const stones = Array.from({ length: 1 + rand(8) }, () => 1 + rand(30))
    assert.equal(solve(JSON.stringify(stones)), oracle(stones), JSON.stringify(stones))
  }
})
