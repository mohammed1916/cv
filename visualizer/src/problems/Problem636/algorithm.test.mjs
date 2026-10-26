import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const parse = logs => logs.map(entry => { const [id, kind, time] = entry.split(':'); return { id: Number(id), kind, time: Number(time) } })

test('636 official examples', () => {
  assert.deepEqual(buildTrace({ n: 2, logs: parse(['0:start:0', '1:start:2', '1:end:5', '0:end:6']) }).result, [3, 4])
  assert.deepEqual(buildTrace({ n: 1, logs: parse(['0:start:0', '0:start:2', '0:end:5', '0:start:6', '0:end:6', '0:end:7']) }).result, [8])
  assert.deepEqual(buildTrace({ n: 2, logs: parse(['0:start:0', '0:end:0', '1:start:1', '1:end:1']) }).result, [1, 1])
})

test('636 random programs match a per-tick simulation', () => {
  let state = 4
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(3)
    // Build a valid nested program: a stack of open functions, timestamps strictly increasing per tick.
    const logs = []
    const open = []
    let time = 0
    for (let step = 0; step < 12; step++) {
      time += 1 + rand(2)
      if (open.length && (rand(2) || open.length > 3)) logs.push(`${open.pop()}:end:${time}`)
      else { const id = rand(n); logs.push(`${id}:start:${time}`); open.push(id) }
    }
    while (open.length) { time += 1; logs.push(`${open.pop()}:end:${time}`) }
    // Oracle: each tick belongs to the function on top of the stack at that tick.
    const top = []
    const tickOwner = []
    let cursor = 0
    for (const entry of logs) {
      const [id, kind, at] = entry.split(':'); const tick = Number(at)
      while (cursor < tick) { if (top.length) tickOwner[cursor] = top.at(-1); cursor++ }
      if (kind === 'start') { top.push(Number(id)) } else { tickOwner[tick] = top.at(-1); cursor = tick + 1; top.pop() }
    }
    const expected = Array(n).fill(0)
    for (const owner of tickOwner) if (owner !== undefined) expected[owner]++
    assert.deepEqual(buildTrace({ n, logs: parse(logs) }).result, expected, JSON.stringify(logs))
  }
})

test('636 rejects malformed logs', () => {
  assert.throws(() => parseInput('{"n":1,"logs":["0-start-0"]}'))
})
