import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const valid = (order, s, out) => {
  if ([...out].sort().join('') !== [...s].sort().join('')) return false
  const rank = c => order.indexOf(c)
  const listed = [...out].filter(c => rank(c) >= 0)
  const firstFree = [...out].findIndex(c => rank(c) < 0)
  if (firstFree >= 0 && [...out].slice(firstFree).some(c => rank(c) >= 0)) return false
  return listed.every((c, i) => i === 0 || rank(listed[i - 1]) <= rank(c))
}
test('official examples', () => {
  assert.equal(buildTrace({ order: 'cba', s: 'abcd' }).result, 'cbad')
  assert.equal(buildTrace({ order: 'bcafg', s: 'abcd' }).result, 'bcad')
})
test('result satisfies the ordering property on random inputs', () => {
  const abc = 'abcdefgh'
  for (let t = 0; t < 400; t++) {
    const order = [...abc].filter(() => Math.random() < 0.5).sort(() => Math.random() - 0.5).join('') || 'a'
    const s = Array.from({ length: 1 + Math.floor(Math.random() * 12) }, () => abc[Math.floor(Math.random() * abc.length)]).join('')
    const run = buildTrace(parseInput(JSON.stringify({ order, s })))
    assert.ok(valid(order, s, run.result), `${order} ${s} ${run.result}`)
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"order":"aa","s":"a"}'))
  assert.throws(() => parseInput('{"order":"a","s":"A"}'))
  assert.throws(() => parseInput('"abc"'))
})
