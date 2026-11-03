import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('2005 orders with a known outcome', () => {
  assert.equal(solve(4), true)
  assert.equal(solve(9), true)
  assert.equal(solve(13), false)
  assert.equal(solve(20), true)
})

test('2005 order 1 is a lone root that Alice must remove', () => {
  assert.equal(solve(1), false)
  assert.equal(solve(7), false)
})

// Oracle: play the game on explicit trees. Removing the root loses at once.
function oracle(n) {
  let id = 0
  const children = new Map()
  const make = order => {
    if (order === 0) return null
    const v = id++
    children.set(v, [])
    if (order === 1) return v
    const a = make(order - 2)
    const b = make(order - 1)
    if (a !== null) children.get(v).push(a)
    children.get(v).push(b)
    return v
  }
  const root = make(n)
  const memo = new Map()
  const wins = alive => {
    const key = alive.join(',')
    if (memo.has(key)) return memo.get(key)
    let res = false
    for (const v of alive) {
      if (v === root) continue
      const gone = new Set()
      const stack = [v]
      while (stack.length) {
        const x = stack.pop()
        gone.add(x)
        for (const c of children.get(x)) stack.push(c)
      }
      if (!wins(alive.filter(x => !gone.has(x)))) { res = true; break }
    }
    memo.set(key, res)
    return res
  }
  return wins([...children.keys()])
}

test('2005 small orders agree with the explicit game', () => {
  for (let n = 1; n <= 6; n += 1) assert.equal(solve(n), oracle(n), `order ${n}`)
})

test('2005 the outcome repeats with period six', () => {
  for (let n = 1; n <= 100; n += 1) assert.equal(solve(n), n % 6 !== 1, `order ${n}`)
})

test('2005 frames point at real lines and rejects order zero', () => {
  const run = buildTrace({ n: 9 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.trim().split('\n').length)
  }
  assert.throws(() => parseInput('{"n":0}'))
})
