import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3484 worked example', () => {
  const ops = [['set', 'A1', 5], ['set', 'B2', 7], ['get', '=A1+B2'], ['get', '=A1+3'], ['reset', 'A1'], ['get', '=A1+B2']]
  assert.deepEqual(buildTrace({ rows: 2, ops }).result, [12, 8, 7])
})

test('3484 unset cells read as zero and reset restores that', () => {
  const ops = [['get', '=C3+D1'], ['set', 'C3', 40], ['get', '=C3+D1'], ['reset', 'C3'], ['get', '=C3+0']]
  assert.deepEqual(buildTrace({ rows: 3, ops }).result, [0, 40, 0])
})

// Independent oracle: recompute each formula from a plain object after every operation.
function oracle(ops) {
  const sheet = {}
  const out = []
  for (const [kind, target, value] of ops) {
    if (kind === 'set') sheet[target] = value
    else if (kind === 'reset') delete sheet[target]
    else {
      const [a, b] = target.slice(1).split('+')
      const read = x => (/^[A-E][1-9]$/.test(x) ? (sheet[x] ?? 0) : Number(x))
      out.push(read(a) + read(b))
    }
  }
  return out
}

test('3484 matches a plain-object oracle on a generated sequence', () => {
  const names = ['A1', 'B1', 'C2', 'E3']
  const ops = []
  for (let i = 0; i < 60; i++) {
    const cell = names[i % names.length]
    if (i % 3 === 0) ops.push(['set', cell, (i * 7) % 100])
    else if (i % 5 === 0) ops.push(['reset', cell])
    else ops.push(['get', `=${cell}+${names[(i + 1) % names.length]}`])
  }
  assert.deepEqual(buildTrace({ rows: 3, ops }).result, oracle(ops))
})

test('3484 rejects a cell outside the sheet and a bad formula', () => {
  assert.throws(() => parseInput('{"rows":2,"ops":[["set","A3",1]]}'))
  assert.throws(() => parseInput('{"rows":2,"ops":[["get","=A1*2"]]}'))
})
