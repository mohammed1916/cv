import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2166 worked examples', () => {
  assert.deepEqual(solve('{"size":5,"ops":[["fix",3],["fix",1],["flip"],["all"],["unfix",0],["flip"],["one"],["unfix",0],["count"],["toString"]]}'),
    [null, null, null, false, null, null, true, null, 2, '01010'])
  assert.deepEqual(solve('{"size":3,"ops":[["toString"],["flip"],["toString"],["count"]]}'), [ '000', null, '111', 3 ])
})

test('2166 rejects invalid input', () => {
  assert.throws(() => parseInput('{"size":0,"ops":[["one"]]}'))
  assert.throws(() => parseInput('{"size":2,"ops":[["fix",2]]}'))
  assert.throws(() => parseInput('{"size":2,"ops":[["count",1]]}'))
  assert.throws(() => parseInput('{"size":2,"ops":[["jump"]]}'))
})

test('2166 random sequences match a plain array model', () => {
  let seed = 2166
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const size = 1 + rnd(8)
    const model = Array(size).fill(0)
    const ops = []
    const expected = []
    for (let k = 0; k < 12; k++) {
      const pick = rnd(7)
      if (pick === 0) { const i = rnd(size); ops.push(['fix', i]); model[i] = 1; expected.push(null) }
      else if (pick === 1) { const i = rnd(size); ops.push(['unfix', i]); model[i] = 0; expected.push(null) }
      else if (pick === 2) { ops.push(['flip']); for (let i = 0; i < size; i++) model[i] ^= 1; expected.push(null) }
      else if (pick === 3) { ops.push(['all']); expected.push(model.every(v => v === 1)) }
      else if (pick === 4) { ops.push(['one']); expected.push(model.some(v => v === 1)) }
      else if (pick === 5) { ops.push(['count']); expected.push(model.filter(v => v === 1).length) }
      else { ops.push(['toString']); expected.push(model.join('')) }
    }
    assert.deepEqual(solve(JSON.stringify({ size, ops })), expected)
  }
})

test('2166 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"size":2,"ops":[["fix",0],["flip"],["count"]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
