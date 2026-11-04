import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

const run = text => buildTrace(parseInput(text)).result

test('2755 worked examples', () => {
  assert.deepEqual(run(EXAMPLES[0].input), { x: 1, n: { p: 1, q: 5 }, y: [1] })
  assert.deepEqual(run(EXAMPLES[1].input), [[8], 6, 7])
  assert.deepEqual(run('{"a":{"a":1,"c":3},"b":{"a":2,"b":2}}'), { a: 2, c: 3, b: 2 })
  assert.deepEqual(run('{"a":[{},2,3],"b":[[],5]}'), [[], 5, 3])
  assert.deepEqual(run('{"a":{"a":1,"b":{"c":[1,[2,7],5],"d":2}},"b":{"a":1,"b":{"c":[6,[6],[9]],"e":3}}}'), { a: 1, b: { c: [6, [6, 7], [9]], d: 2, e: 3 } })
  assert.throws(() => parseInput('{"a":[]}'))
})
