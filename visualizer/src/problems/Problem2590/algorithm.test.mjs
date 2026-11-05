import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const run = ops => buildTrace(parseInput(JSON.stringify({ ops }))).result
const PY = python.split('\n')

test('2590 worked example', () => {
  const ops = [['add', 1, 'Task1', 50, []], ['add', 1, 'Task2', 100, ['P1']], ['list', 1], ['list', 5], ['add', 1, 'Task3', 30, ['P1']], ['tag', 1, 'P1'], ['complete', 5, 1], ['complete', 1, 2], ['tag', 1, 'P1'], ['list', 1]]
  assert.deepEqual(run(ops), [1, 2, ['Task1', 'Task2'], [], 3, ['Task3', 'Task2'], null, null, ['Task3'], ['Task3', 'Task1']])
})

test('2590 frames point at real python lines', () => {
  for (const f of buildTrace(parseInput('{"ops":[["add",1,"a",3,[]],["complete",1,1],["list",1]]}')).frames) if (f.pythonLine) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2590 rejects unknown operations', () => {
  assert.throws(() => parseInput('{"ops":[["remove",1]]}'))
})

// Oracle: keep each user's tasks in a plain list and sort a fresh copy for every query.
function oracle(ops) {
  const store = {}
  let id = 1
  return ops.map(op => {
    if (op[0] === 'add') { (store[op[1]] ??= []).push({ id, text: op[2], due: op[3], tags: op[4], done: false }); return id++ }
    if (op[0] === 'complete') { for (const t of store[op[1]] ?? []) if (t.id === op[2]) t.done = true; return null }
    const rows = (store[op[1]] ?? []).filter(t => !t.done && (op[0] !== 'tag' || t.tags.includes(op[2])))
    return [...rows].sort((a, b) => (a.due - b.due) || (a.id - b.id)).map(t => t.text)
  })
}

test('2590 random operation sequences match an oracle', () => {
  let seed = 2590
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const ops = []
    for (let k = 0; k < 15; k++) {
      const user = 1 + rnd(2), r = rnd(4)
      if (r === 0) ops.push(['add', user, `t${k}`, 1 + rnd(9), rnd(2) ? ['A'] : ['A', 'B']])
      else if (r === 1) ops.push(['complete', user, 1 + rnd(8)])
      else if (r === 2) ops.push(['list', user])
      else ops.push(['tag', user, rnd(2) ? 'A' : 'B'])
    }
    assert.deepEqual(run(ops), oracle(ops), JSON.stringify(ops))
  }
})
