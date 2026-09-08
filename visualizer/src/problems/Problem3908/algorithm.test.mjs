import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3908 every allowed number and digit match an arithmetic oracle', () => {
  for (let n = 0; n <= 100000; n++) {
    let remaining = n, leading = 0, bits = 0
    do { leading = remaining % 10; bits |= 1 << leading; remaining = Math.floor(remaining / 10) } while (remaining)
    for (let x = 0; x <= 9; x++) {
      const run = buildTrace({ n, x })
      assert.equal(run.result, Boolean(bits & (1 << x)) && leading !== x)
      let found = false
      for (const frame of run.frames) if (frame.phase === 'scan') {
        found ||= Number(run.input[frame.index]) === x
        assert.equal(frame.found, found)
        assert.equal(frame.leading, null)
      }
    }
  }
})

test('3908 examples, zero and validation', () => {
  for (const [n, x, expected] of [[101, 0, true], [232, 2, false], [5, 1, false], [0, 0, false], [100000, 0, true]]) assert.equal(buildTrace(parseInput(JSON.stringify({ n, x }))).result, expected)
  for (const data of [null, {}, { n: -1, x: 0 }, { n: 100001, x: 0 }, { n: 1.5, x: 0 }, { n: 1, x: -1 }, { n: 1, x: 10 }, { n: 1, x: 1.5 }, { n: '101', x: 0 }]) assert.throws(() => parseInput(JSON.stringify(data)))
})
