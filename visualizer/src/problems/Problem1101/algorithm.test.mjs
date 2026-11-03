import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

// Oracle: for each distinct time in ascending order, test connectivity with a BFS over all logs at or before it.
function oracle({ n, logs }) {
  const times = [...new Set(logs.map(log => log[0]))].sort((a, b) => a - b)
  for (const t of times) {
    const adj = Array.from({ length: n }, () => [])
    for (const [time, a, b] of logs) if (time <= t) { adj[a].push(b); adj[b].push(a) }
    const seen = new Set([0])
    const queue = [0]
    while (queue.length) for (const next of adj[queue.shift()]) if (!seen.has(next)) { seen.add(next); queue.push(next) }
    if (seen.size === n) return t
  }
  return -1
}

test('sample becomes one group at the time the last bridge joins', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.equal(trace.result, 50)
})

test('isolated people and tiny groups', () => {
  assert.equal(run(examples[1].input).result, -1)
  assert.equal(run(examples[2].input).result, 9)
})

test('matches a connectivity oracle on seeded logs', () => {
  let seed = 1101
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const count = rnd(12)
    const logs = []
    for (let i = 0; i < count; i++) {
      const a = rnd(n)
      let b = rnd(n)
      if (b === a) b = (a + 1) % n
      logs.push([rnd(40), a, b])
    }
    const input = { n, logs }
    const trace = buildTrace(parseInput(JSON.stringify(input)))
    checkFrames(trace)
    assert.equal(trace.result, oracle(input), JSON.stringify(input))
  }
})

test('rejects people outside the range and self-links', () => {
  assert.throws(() => parseInput('{"n":3,"logs":[[1,0,3]]}'))
  assert.throws(() => parseInput('{"n":3,"logs":[[1,2,2]]}'))
  assert.throws(() => parseInput('{"n":3,"logs":[[1,0]]}'))
})
