import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = items => buildTrace(parseInput(JSON.stringify(items))).result

test('666 official example', () => {
  // 3→5 gives 35 and 3→1 gives 31.
  assert.equal(solve(['113', '215', '221']), 66)
})

test('666 single root', () => {
  assert.equal(solve(['117']), 7)
})

test('666 rejects a missing parent', () => {
  assert.throws(() => parseInput('["113","317"]'))
})

// Independent oracle: find leaves by looking for children, then climb to the root and read the digits.
function oracle(items) {
  const value = new Map(items.map(s => [`${s[0]}-${s[1]}`, Number(s[2])]))
  let total = 0
  for (const [key] of value) {
    const [depth, position] = key.split('-').map(Number)
    if (value.has(`${depth + 1}-${2 * position - 1}`) || value.has(`${depth + 1}-${2 * position}`)) continue
    const digits = []
    for (let d = depth, p = position; d >= 1; d--, p = Math.ceil(p / 2)) digits.unshift(value.get(`${d}-${p}`))
    total += Number(digits.join(''))
  }
  return total
}

test('666 random trees match a leaf-climbing oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const items = [`11${rnd(10)}`]
    const present = new Set(['1-1'])
    for (let depth = 1; depth < 4; depth++) {
      for (let position = 1; position <= 2 ** (depth - 1); position++) {
        if (!present.has(`${depth}-${position}`)) continue
        for (const child of [2 * position - 1, 2 * position]) {
          if (items.length < 15 && rnd(2)) {
            items.push(`${depth + 1}${child}${rnd(10)}`)
            present.add(`${depth + 1}-${child}`)
          }
        }
      }
    }
    assert.equal(solve(items), oracle(items), JSON.stringify(items))
  }
})
