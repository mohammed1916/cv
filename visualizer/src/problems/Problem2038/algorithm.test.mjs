import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: play the game with the real rules (remove an inner piece whose two neighbours share its colour).
function oracle(colors) {
  const memo = new Map()
  // Returns true when the player to move wins. Player 0 = Alice (A), 1 = Bob (B).
  const win = (line, turn) => {
    const key = `${line}|${turn}`
    if (memo.has(key)) return memo.get(key)
    const mine = turn === 0 ? 'A' : 'B'
    let result = false
    for (let i = 1; i + 1 < line.length && !result; i++) {
      if (line[i] === mine && line[i - 1] === mine && line[i + 1] === mine) {
        result = !win(line.slice(0, i) + line.slice(i + 1), 1 - turn)
      }
    }
    memo.set(key, result)
    return result
  }
  return win(colors, 0)
}

test('examples', () => {
  assert.equal(solve('{"colors":"AAABABB"}'), true)
  assert.equal(solve('{"colors":"AA"}'), false)
  assert.equal(solve('{"colors":"ABBBBBBBAAA"}'), false)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"colors":"AAA"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random strings match the game-play oracle', () => {
  let state = 499
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const colors = Array.from({ length: 1 + rand(12) }, () => 'AB'[rand(2)]).join('')
    assert.equal(solve(JSON.stringify({ colors })), oracle(colors), colors)
  }
})
