import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'

test('2424 the longest prefix only grows once the gap closes', () => {
  const r = buildTrace({ n: 4, ops: [['upload', 3], ['longest'], ['upload', 1], ['longest'], ['upload', 2], ['longest']] })
  assert.deepEqual(r.result, [0, 1, 3])
})

test('2424 a repeated prefix stays put', () => {
  const r = buildTrace({ n: 3, ops: [['upload', 2], ['longest'], ['upload', 1], ['longest'], ['upload', 3], ['longest']] })
  assert.deepEqual(r.result, [0, 2, 3])
})

test('2424 the python class matches the trace on random streams', () => {
  let seed = 2424
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 20; t++) {
    const n = 1 + rnd(6)
    const order = Array.from({ length: n }, (_, i) => i + 1).sort(() => rnd(3) - 1)
    const ops = []
    order.forEach(v => { ops.push(['upload', v]); ops.push(['longest']) })
    const expected = buildTrace({ n, ops }).result
    const script = `${python}\nobj = LUPrefix(${n})\nout = []\nfor op in ${JSON.stringify(ops)}:\n    if op[0] == 'upload':\n        obj.upload(op[1])\n    else:\n        out.append(obj.longest())\nprint(out)`
    const got = execFileSync(PYTHON, ['-I', '-c', script]).toString().trim()
    assert.equal(got, `[${expected.join(', ')}]`)
  }
})

test('2424 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 2, ops: [['upload', 1], ['longest']] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2424 rejects bad calls', () => {
  assert.throws(() => parseInput('{"n":2,"ops":[["upload",3]]}'))
  assert.throws(() => parseInput('{"n":2,"ops":[["peek"]]}'))
})
