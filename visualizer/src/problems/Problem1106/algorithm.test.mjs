import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = expression => buildTrace({ expression }).result

test('1106 official examples', () => {
  assert.equal(solve('!(f)'), true)
  assert.equal(solve('|(f,t)'), true)
  assert.equal(solve('&(t,f)'), false)
  assert.equal(solve('|(&(t,f,t),!(t))'), false)
})

test('1106 a single literal and nested operators', () => {
  assert.equal(solve('t'), true)
  assert.equal(solve('!(!(f))'), false)
})

test('1106 rejects a malformed expression', () => {
  assert.throws(() => solve('!(t,f)'))
  assert.throws(() => solve('&(t'))
  assert.throws(() => parseInput('{"expression":"t x"}'))
})

// Independent oracle: rewrite the grammar as JavaScript calls and let the JavaScript engine evaluate it.
function oracle(expression) {
  const js = expression.replace(/!/g, 'NOT').replace(/&/g, 'AND').replace(/\|/g, 'OR')
  const run = new Function('t', 'f', 'NOT', 'AND', 'OR', `return ${js}`)
  return run(true, false, x => !x, (...a) => a.every(Boolean), (...a) => a.some(Boolean))
}

test('1106 random expressions match a JavaScript evaluation oracle', () => {
  let seed = 1106
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = depth => {
    if (depth > 2 || rnd(3) === 0) return 'tf'[rnd(2)]
    const op = '!&|'[rnd(3)]
    const count = op === '!' ? 1 : 2 + rnd(2)
    const args = Array.from({ length: count }, () => build(depth + 1))
    return `${op}(${args.join(',')})`
  }
  for (let t = 0; t < 300; t++) {
    const expression = build(0)
    assert.equal(solve(expression), oracle(expression), expression)
  }
})
