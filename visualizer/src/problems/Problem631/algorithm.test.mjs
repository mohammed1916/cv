import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('631 official example', () => {
  const spec = { h: 3, w: 'C', ops: [['set', 1, 'A', 2], ['sum', 3, 'C', ['A1', 'A1:B2']], ['set', 2, 'B', 2], ['get', 3, 'C']] }
  assert.deepEqual(buildTrace(spec).result, [null, 4, null, 6])
})

test('631 chained sums follow later changes', () => {
  const spec = { h: 3, w: 'B', ops: [['set', 1, 'A', 4], ['sum', 2, 'A', ['A1']], ['sum', 3, 'B', ['A2', 'A1']], ['set', 1, 'A', 1], ['get', 3, 'B']] }
  assert.deepEqual(buildTrace(spec).result, [null, 4, 8, null, 2])
})

test('631 rejects a sum that depends on its own cell', () => {
  assert.throws(() => buildTrace({ h: 2, w: 'B', ops: [['sum', 1, 'A', ['A1']]] }), /depend/)
})

test('631 rejects malformed sheets', () => {
  assert.throws(() => parseInput('{"h":2,"w":"K","ops":[["get",1,"A"]]}'))
  assert.throws(() => parseInput('{"h":2,"w":"B","ops":[["sum",1,"A",["C1"]]]}'))
})

// Independent oracle: keep each cell as a number or a list of referenced names, evaluated recursively on every read.
function oracle(ops) {
  const cell = new Map()
  const expand = ref => {
    const [from, to = from] = ref.split(':')
    const out = []
    for (let r = Number(from.slice(1)); r <= Number(to.slice(1)); r++) {
      for (let c = from.charCodeAt(0); c <= to.charCodeAt(0); c++) out.push(String.fromCharCode(c) + r)
    }
    return out
  }
  const evaluate = name => {
    const stored = cell.get(name) ?? 0
    return Array.isArray(stored) ? stored.reduce((total, ref) => total + evaluate(ref), 0) : stored
  }
  return ops.map(([kind, row, column, arg]) => {
    const name = `${column}${row}`
    if (kind === 'set') { cell.set(name, arg); return null }
    if (kind === 'sum') { cell.set(name, arg.flatMap(expand)); return evaluate(name) }
    return evaluate(name)
  })
}

test('631 random sheets match a recursive oracle', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const h = 1 + rnd(4), w = 'ABCD'[rnd(4)], cols = w.charCodeAt(0) - 64
    const ops = []
    for (let i = 0; i < 1 + rnd(15); i++) {
      const r = rnd(h), c = rnd(cols), column = 'ABCD'[c], row = r + 1
      // Formulas may only read cells earlier in row-major order, so the generated sheet has no cycles.
      const earlier = []
      for (let rr = 0; rr < h; rr++) for (let cc = 0; cc < cols; cc++) if (rr * cols + cc < r * cols + c) earlier.push(`${'ABCD'[cc]}${rr + 1}`)
      if (earlier.length === 0 || rnd(3) === 0) ops.push(rnd(2) ? ['set', row, column, rnd(20)] : ['get', row, column])
      else ops.push(['sum', row, column, Array.from({ length: 1 + rnd(3) }, () => earlier[rnd(earlier.length)])])
    }
    assert.deepEqual(buildTrace({ h, w, ops }).result, oracle(ops), JSON.stringify({ h, w, ops }))
  }
})
