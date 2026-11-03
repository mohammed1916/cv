import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function assertFrames(trace) {
  assert.ok(trace.frames.length >= 2)
  for (const frame of trace.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine > 0)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine > 0)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const SAMPLE = JSON.stringify({ samples: [
  { sample_id: 3, dna_sequence: 'ATGGGCTGA', species: 'cat' },
  { sample_id: 1, dna_sequence: 'ATGCCGTAA', species: 'mouse' },
  { sample_id: 5, dna_sequence: 'TGAAAT', species: 'owl' },
  { sample_id: 2, dna_sequence: 'GATTACA', species: 'fly' },
  { sample_id: 4, dna_sequence: 'CCCATAG', species: 'dog' },
] })

test('3475 sample flags are correct and ordered by sample_id', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { sample_id: 1, starts_with_atg: 1, ends_with_stop: 1, has_run: 0 },
    { sample_id: 2, starts_with_atg: 0, ends_with_stop: 0, has_run: 0 },
    { sample_id: 3, starts_with_atg: 1, ends_with_stop: 1, has_run: 1 },
    { sample_id: 4, starts_with_atg: 0, ends_with_stop: 1, has_run: 1 },
    { sample_id: 5, starts_with_atg: 0, ends_with_stop: 0, has_run: 1 },
  ])
  assertFrames(trace)
})

test('3475 rejects bases outside ACGT and accepts an empty table', () => {
  assert.deepEqual(solve('{"samples":[]}'), [])
  assert.throws(() => parseInput('{"samples":[{"sample_id":1,"dna_sequence":"ATGN","species":"x"}]}'))
})

// Independent oracle: scan letter by letter instead of using patterns.
function oracle(seq) {
  const starts = seq.slice(0, 3) === 'ATG' ? 1 : 0
  const last3 = seq.slice(-3)
  const ends = ['TAA', 'TAG', 'TGA'].includes(last3) ? 1 : 0
  let run = 0
  for (let i = 0; i < seq.length; i++) {
    run = i > 0 && seq[i] === seq[i - 1] ? run + 1 : 1
    if (run >= 3) break
  }
  return [starts, ends, run >= 3 ? 1 : 0]
}

test('3475 random sequences match the letter-by-letter oracle', () => {
  let seed = 3475
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const seq = Array.from({ length: 1 + rnd(9) }, () => 'ACGT'[rnd(4)]).join('')
    const [starts, ends, run] = oracle(seq)
    const [row] = solve(JSON.stringify({ samples: [{ sample_id: 1, dna_sequence: seq, species: 's' }] }))
    assert.deepEqual([row.starts_with_atg, row.ends_with_stop, row.has_run], [starts, ends, run], seq)
  }
})
