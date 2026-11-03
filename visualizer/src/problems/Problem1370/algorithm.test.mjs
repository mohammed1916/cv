import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

// Independent oracle: keep the distinct letters sorted, then sweep them up and down until none remain.
function reference(s) {
  const cnt = new Map()
  for (const c of s) cnt.set(c, (cnt.get(c) || 0) + 1)
  let out = ''
  while (cnt.size) {
    const asc = [...cnt.keys()].sort()
    const sweep = list => {
      for (const c of list) {
        if (!cnt.has(c)) continue
        out += c
        const left = cnt.get(c) - 1
        if (left === 0) cnt.delete(c); else cnt.set(c, left)
      }
    }
    sweep(asc)
    sweep([...asc].reverse())
  }
  return out
}

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('hand-checked strings', () => {
  assert.equal(solve('aab'), 'aba')
  assert.equal(solve('aaaabbbbcccc'), 'abccbaabccba')
  assert.equal(solve('ggggg'), 'ggggg')
  assert.equal(solve('z'), 'z')
})

test('random strings agree with the sorted-sweep oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return (state >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rand(40)
    const s = Array.from({ length: len }, () => 'abcdefz'[rand(7)]).join('')
    assert.equal(solve(s), reference(s), s)
  }
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"s":"abcab"}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"s":"ABC"}'), /lowercase/)
  assert.throws(() => parseInput('{"s":""}'), /lowercase/)
})
