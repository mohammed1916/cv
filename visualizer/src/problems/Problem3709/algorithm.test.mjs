import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (operations, args) => buildTrace({ operations, arguments: args }).result

test('3709 official example call sequence', () => {
  const ops = ['record', 'totalScore', 'record', 'totalScore', 'totalScore', 'totalScore', 'totalScore']
  const args = [[1, 98], [1, 1], [5, 99], [1, 3], [1, 5], [3, 4], [2, 5]]
  assert.deepEqual(solve(ops, args), [null, 98, null, 98, 197, 0, 99])
})

test('3709 a window with no exams sums to 0', () => {
  assert.deepEqual(solve(['record', 'totalScore'], [[2, 7], [3, 4]]), [null, 0])
})

test('3709 rejects non-increasing record times and a query past the latest time', () => {
  assert.throws(() => parseInput('{"operations":["record","record"],"arguments":[[5,1],[5,2]]}'))
  assert.throws(() => parseInput('{"operations":["record","totalScore"],"arguments":[[1,1],[1,2]]}'))
  assert.throws(() => parseInput('{"operations":["totalScore"],"arguments":[[1,1]]}'))
})

// Independent oracle: keep every recorded exam in a list and filter it for each query.
function oracle(operations, args) {
  const exams = []
  const out = []
  operations.forEach((op, i) => {
    if (op === 'record') {
      exams.push({ time: args[i][0], score: args[i][1] })
      out.push(null)
    } else {
      const [a, b] = args[i]
      out.push(exams.filter(e => e.time >= a && e.time <= b).reduce((s, e) => s + e.score, 0))
    }
  })
  return out
}

test('3709 random call sequences match a filter oracle', () => {
  let seed = 3709
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const ops = ['record']
    const args = [[1 + rnd(5), 1 + rnd(100)]]
    let latest = args[0][0]
    const count = 1 + rnd(10)
    for (let i = 1; i < count; i++) {
      if (rnd(2) === 0) {
        latest += 1 + rnd(4)
        ops.push('record')
        args.push([latest, 1 + rnd(100)])
      } else {
        const a = 1 + rnd(latest)
        const b = a + rnd(latest - a + 1)
        ops.push('totalScore')
        args.push([a, b])
      }
    }
    assert.deepEqual(solve(ops, args), oracle(ops, args), JSON.stringify({ ops, args }))
  }
})
