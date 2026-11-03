import test from 'node:test'
import assert from 'node:assert/strict'
import { minCostToChangeFinalValue, evaluate } from './algorithm.js'

// Breadth-first search over single edits: flip one digit, or flip one operator. Parentheses never change.
function bruteForce(text) {
  const start = evaluate(text)
  const seen = new Set([text])
  let frontier = [text]
  for (let depth = 0; frontier.length; depth++) {
    const next = []
    for (const s of frontier) {
      if (evaluate(s) !== start) return depth
      for (let i = 0; i < s.length; i++) {
        const c = s[i]
        const changed = c === '0' ? '1' : c === '1' ? '0' : c === '&' ? '|' : c === '|' ? '&' : null
        if (changed === null) continue
        const t = s.slice(0, i) + changed + s.slice(i + 1)
        if (!seen.has(t)) { seen.add(t); next.push(t) }
      }
    }
    frontier = next
  }
  return -1
}

test('1896 a single operator inside a group', () => {
  assert.equal(minCostToChangeFinalValue('1&(0&1)'), 1)
})

test('1896 a lone digit costs one edit', () => {
  assert.equal(minCostToChangeFinalValue('0'), 1)
  assert.equal(minCostToChangeFinalValue('1'), 1)
})

test('1896 an all-zero group needs several edits to flip', () => {
  assert.equal(minCostToChangeFinalValue('(0&1)|(0&1&1)'), 1)
  assert.equal(minCostToChangeFinalValue('(1|0)&(1|1)'), 1)
})

test('1896 agrees with a brute-force search on seeded random expressions', () => {
  let seed = 11
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  const build = depth => {
    if (depth === 0 || rand(3) === 0) return String(rand(2))
    const parts = Array.from({ length: 2 + rand(2) }, () => build(depth - 1))
    const body = parts.reduce((acc, p) => acc + (rand(2) ? '&' : '|') + p)
    return rand(2) ? `(${body})` : body
  }
  let checked = 0
  for (let round = 0; round < 200 && checked < 60; round++) {
    const text = build(3)
    if (text.length > 9 || !/[&|]/.test(text)) continue
    checked += 1
    assert.equal(minCostToChangeFinalValue(text), bruteForce(text), text)
  }
  assert.ok(checked >= 30)
})
