import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('682 official examples', () => {
  assert.equal(buildTrace(['5', '2', 'C', 'D', '+']).result, 30)
  assert.equal(buildTrace(['5', '-2', '4', 'C', 'D', '9', '+', '+']).result, 27)
  assert.equal(buildTrace(['1', 'C']).result, 0)
})

test('682 random operation lists match a direct recursion over the record', () => {
  let state = 7
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const ops = []
    const record = []
    for (let i = 0; i < 1 + rand(12); i++) {
      const choice = rand(4)
      if (choice === 0 || record.length < 2) { const v = rand(21) - 10; ops.push(String(v)); record.push(v) }
      else if (choice === 1) { ops.push('+'); record.push(record[record.length - 1] + record[record.length - 2]) }
      else if (choice === 2) { ops.push('D'); record.push(record[record.length - 1] * 2) }
      else { ops.push('C'); record.pop() }
    }
    assert.equal(buildTrace(ops).result, record.reduce((a, b) => a + b, 0), JSON.stringify(ops))
  }
})

test('682 rejects unknown operations', () => {
  assert.throws(() => parseInput('["x"]'))
})
