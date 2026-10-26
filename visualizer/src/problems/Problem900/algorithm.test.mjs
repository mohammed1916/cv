import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (enc, ns) => buildTrace(parseInput(JSON.stringify([['RLEIterator', ...ns.map(() => 'next')], [[enc], ...ns.map(n => [n])]])))

// Independent oracle: expand the sequence fully and slice it.
function brute(enc, ns) {
  const seq = []
  for (let i = 0; i < enc.length; i += 2) for (let c = 0; c < enc[i]; c++) seq.push(enc[i + 1])
  let pos = 0
  return ns.map(n => { pos += n; return pos > seq.length ? -1 : seq[pos - 1] })
}

test('official example', () => {
  assert.deepEqual(run([3, 8, 0, 9, 2, 5], [2, 1, 1, 2]).result, [8, 8, 5, -1])
})

test('matches full-expansion oracle on random inputs', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 500; t++) {
    const runs = 1 + rnd(5)
    const enc = []
    for (let i = 0; i < runs; i++) enc.push(rnd(5), rnd(10))
    const ns = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(6))
    const trace = run(enc, ns)
    assert.deepEqual(trace.result, brute(enc, ns), JSON.stringify({ enc, ns }))
    assert.equal(trace.frames.at(-1).phase, 'done')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[["RLEIterator","next"],[[[1,2,3]],[1]]]'))
  assert.throws(() => parseInput('[["RLEIterator","next"],[[[1,2]],[0]]]'))
  assert.throws(() => parseInput('[["RLEIterator","peek"],[[[1,2]],[1]]]'))
  assert.throws(() => parseInput('[["Iter","next"],[[[1,2]],[1]]]'))
  assert.throws(() => parseInput('3'))
})
