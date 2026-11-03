import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = tokens => buildTrace(tokens).result

// Independent oracle: build the expression tree from the postfix tokens, then evaluate it recursively.
function treeValue(tokens) {
  let pos = tokens.length - 1
  const node = () => {
    const t = tokens[pos--]
    if (!['+', '-', '*', '/'].includes(t)) return Number(t)
    const right = node()
    const left = node()
    if (t === '+') return left + right
    if (t === '-') return left - right
    if (t === '*') return left * right
    return Math.trunc(left / right) || 0
  }
  return node()
}

// Random postfix expression: a leaf, or an operator applied to two sub-expressions. Divisors are nonzero leaves.
function randomExpression(rnd, depth, out) {
  if (depth === 0 || rnd(3) === 0) { out.push(String(rnd(19) - 9)); return }
  const op = ['+', '-', '*', '/'][rnd(4)]
  randomExpression(rnd, depth - 1, out)
  if (op === '/') out.push(String(1 + rnd(9)))
  else randomExpression(rnd, depth - 1, out)
  out.push(op)
}

test('150 sample tokens evaluate correctly', () => {
  assert.equal(solve(['2', '1', '+', '3', '*']), 9)
  assert.equal(solve(['7', '2', '-', '5', '*']), 25)
  assert.equal(solve(['6', '3', '/', '4', '*']), 8)
  assert.equal(solve(['-7', '2', '/']), -3)
  assert.equal(solve(['5']), 5)
})

test('150 parseInput rejects malformed tokens', () => {
  assert.throws(() => parseInput('["2","%"]'), /Token 2/)
  assert.throws(() => parseInput('["25","1","+"]'), /Token 1/)
  assert.throws(() => parseInput('[2,1,"+"]'), /Token 1/)
})

test('150 invalid stacks and division by zero are reported', () => {
  assert.throws(() => buildTrace(['2', '+']), /needs two values/)
  assert.throws(() => buildTrace(['2', '0', '/']), /division by zero/)
  assert.throws(() => buildTrace(['2', '3']), /exactly one/)
})

test('150 random expressions match the expression-tree oracle', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const tokens = []
    randomExpression(rnd, 3, tokens)
    if (tokens.length > 15) continue
    assert.equal(solve(tokens), treeValue(tokens), JSON.stringify(tokens))
  }
})

test('150 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace(['2', '1', '+', '3', '*'])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
