import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (start, end) => buildTrace(parseInput(JSON.stringify({ start, end }))).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

test('3986 authored examples', () => {
  assert.equal(solve('08:15:30', '09:45:10'), 5380)
  assert.equal(solve('23:59:58', '23:59:59'), 1)
  assert.equal(solve('12:00:00', '12:00:00'), 0)
})

test('3986 whole-day boundaries', () => {
  assert.equal(solve('00:00:00', '23:59:59'), 86399)
  assert.equal(solve('00:00:59', '01:00:00'), 3541)
})

test('3986 rejects malformed or reversed times', () => {
  assert.throws(() => parseInput('{"start":"8:15:30","end":"09:45:10"}'))
  assert.throws(() => parseInput('{"start":"24:00:00","end":"24:00:01"}'))
  assert.throws(() => parseInput('{"start":"10:00:00","end":"09:00:00"}'))
})

test('3986 random times match a Date-based oracle', () => {
  let seed = 3986
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pad = v => String(v).padStart(2, '0')
  const randomClock = () => `${pad(rnd(24))}:${pad(rnd(60))}:${pad(rnd(60))}`
  for (let t = 0; t < 300; t++) {
    let a = randomClock(), b = randomClock()
    if (a > b) [a, b] = [b, a]
    const oracle = (Date.parse(`1970-01-01T${b}Z`) - Date.parse(`1970-01-01T${a}Z`)) / 1000
    assert.equal(solve(a, b), oracle, `${a} ${b}`)
    checkFrames(buildTrace({ start: a, end: b }))
  }
})
