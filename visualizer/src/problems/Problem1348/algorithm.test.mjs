import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1348 official style examples', () => {
  const ops = [['record', 'tweet', 0], ['record', 'tweet', 60], ['record', 'tweet', 10], ['query', 'minute', 'tweet', 0, 59], ['query', 'minute', 'tweet', 0, 60]]
  assert.deepEqual(solve({ ops }), [[2], [2, 1]])
  assert.deepEqual(solve({ ops: [...ops, ['query', 'hour', 'tweet', 0, 200]] }), [[2], [2, 1], [3]])
})

test('1348 an unknown name counts as zero in every bucket', () => {
  assert.deepEqual(solve({ ops: [['query', 'day', 'none', 0, 0]] }), [[0]])
})

test('1348 rejects an unknown frequency', () => {
  assert.throws(() => parseInput('{"ops":[["query","week","a",0,1]]}'))
})

// Independent oracle: drop every recorded time into its bucket index directly.
function oracle({ ops }) {
  const recorded = new Map()
  const out = []
  for (const op of ops) {
    if (op[0] === 'record') recorded.set(op[1], [...(recorded.get(op[1]) ?? []), op[2]])
    else {
      const [, freq, name, start, end] = op
      const delta = { minute: 60, hour: 3600, day: 86400 }[freq]
      const counts = Array(Math.floor((end - start) / delta) + 1).fill(0)
      for (const t of recorded.get(name) ?? []) if (t >= start && t <= end) counts[Math.floor((t - start) / delta)]++
      out.push(counts)
    }
  }
  return out
}

test('1348 random operation lists match a bucket-index oracle', () => {
  let seed = 1348
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['a', 'b']
  const freqs = ['minute', 'hour', 'day']
  for (let t = 0; t < 300; t++) {
    const ops = []
    for (let k = 0; k < 1 + rnd(12); k++) {
      if (rnd(2) === 0) ops.push(['record', names[rnd(2)], rnd(201)])
      else {
        const start = rnd(201)
        const end = start + rnd(201 - start)
        ops.push(['query', freqs[rnd(3)], names[rnd(2)], start, end])
      }
    }
    const input = { ops }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
