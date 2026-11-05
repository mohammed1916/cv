import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const run = ops => buildTrace({ ops: ops.map(o => (o.op === 'deposit' ? o : o)) }).result

test('2241 greedy withdrawal from the largest notes', () => {
  const ops = [
    { op: 'deposit', counts: [0, 0, 0, 3, 1] },
    { op: 'withdraw', amount: 600 },
    { op: 'withdraw', amount: 500 },
    { op: 'withdraw', amount: 400 },
    { op: 'withdraw', amount: 20 },
  ]
  assert.deepEqual(run(ops), [null, [-1], [0, 0, 0, 0, 1], [0, 0, 0, 2, 0], [-1]])
})

test('2241 a rejected withdrawal changes nothing', () => {
  const ops = [
    { op: 'deposit', counts: [1, 0, 0, 0, 0] },
    { op: 'withdraw', amount: 40 },
    { op: 'withdraw', amount: 20 },
  ]
  assert.deepEqual(run(ops), [null, [-1], [1, 0, 0, 0, 0]])
})

test('2241 frames point at real python lines', () => {
  for (const f of buildTrace({ ops: [{ op: 'deposit', counts: [1, 1, 1, 1, 1] }, { op: 'withdraw', amount: 50 }] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2241 rejects unknown calls and bad counts', () => {
  assert.throws(() => parseInput('{"ops":[{"op":"peek"}]}'))
  assert.throws(() => parseInput('{"ops":[{"op":"deposit","counts":[1,1,1,1]}]}'))
})

test('2241 the python class matches the trace', () => {
  const script = `${python}\na = ATM()\na.deposit([0, 0, 0, 3, 1])\nprint(a.withdraw(600), a.withdraw(500), a.withdraw(400), a.withdraw(20))`
  const out = execFileSync(PYTHON, ['-I', '-c', script]).toString().trim()
  assert.equal(out, '[-1] [0, 0, 0, 0, 1] [0, 0, 0, 2, 0] [-1]')
})
