import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = expr => buildTrace(expr).result

test('772 official examples', () => {
  assert.equal(solve('1+1'), 2)
  assert.equal(solve('6-4/2'), 4)
  assert.equal(solve('2*(5+5*2)/3+(6/2+8)'), 21)
  assert.equal(solve('(2+6*3+5-(3*14/7+2)*5)+3'), -12)
})

test('772 division truncates toward zero', () => {
  assert.equal(solve('7/2'), 3)
  assert.equal(solve('0-7/2'), -3)
})

test('772 rejects an unbalanced expression', () => {
  assert.throws(() => buildTrace('(1+2'))
})

// Independent oracle: shunting-yard, which is a different method from the recursive descent in the solver.
function oracle(expr) {
  const tokens = expr.match(/\d+|[-+*/()]/g)
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 }
  const apply = (a, op, b) => {
    if (op === '+') return a + b
    if (op === '-') return a - b
    if (op === '*') return a * b
    if (b === 0) throw new Error('Division by zero.')
    return Math.trunc(a / b)
  }
  const values = [], ops = []
  const reduce = () => {
    const op = ops.pop()
    const b = values.pop(), a = values.pop()
    values.push(apply(a, op, b))
  }
  for (const t of tokens) {
    if (/^\d+$/.test(t)) values.push(Number(t))
    else if (t === '(') ops.push(t)
    else if (t === ')') {
      while (ops.at(-1) !== '(') reduce()
      ops.pop()
    } else {
      while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t]) reduce()
      ops.push(t)
    }
  }
  while (ops.length) reduce()
  return values[0]
}

test('772 random expressions match a shunting-yard oracle', () => {
  let seed = 101
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const operators = ['+', '-', '*', '/']
  const build = depth => {
    if (depth === 0 || rnd(3) === 0) return String(rnd(20))
    const wrap = s => (rnd(2) ? `(${s})` : s)
    return `${wrap(build(depth - 1))}${operators[rnd(4)]}${wrap(build(depth - 1))}`
  }
  for (let t = 0; t < 400; t++) {
    const expr = build(3)
    let expected, actual
    try { expected = oracle(expr) } catch { expected = 'error' }
    try { actual = solve(expr) } catch { actual = 'error' }
    assert.equal(actual, expected, expr)
  }
})
