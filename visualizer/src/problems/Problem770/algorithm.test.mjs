import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, tokenize } from './algorithm.js'

const run = (expression, evalvars = [], evalints = []) => buildTrace(parseInput(JSON.stringify({ expression, evalvars, evalints })))
test('official examples', () => {
  assert.deepEqual(run('e + 8 - a + 5', ['e'], [1]).result, ['-1*a', '14'])
  assert.deepEqual(run('e - 8 + temperature - pressure', ['e', 'temperature'], [1, 12]).result, ['-1*pressure', '5'])
  assert.deepEqual(run('(e + 8) * (e - 8)').result, ['1*e*e', '-64'])
  assert.deepEqual(run('7 - 7').result, [])
  assert.deepEqual(run('a * b * c + b * a * c * 4').result, ['5*a*b*c'])
  assert.deepEqual(run('((a - b) * (b - c) + (c - a)) * ((a - b) + (b - c) * (c - a))').result,
    ['-1*a*a*b*b', '2*a*a*b*c', '-1*a*a*c*c', '1*a*b*b*b', '-1*a*b*b*c', '-1*a*b*c*c', '1*a*c*c*c', '-1*b*b*b*c', '2*b*b*c*c', '-1*b*c*c*c', '2*a*a*b', '-2*a*a*c', '-2*a*b*b', '2*a*c*c', '1*b*b*b', '-1*b*b*c', '1*b*c*c', '-1*c*c*c', '-1*a*a', '1*a*b', '1*a*c', '-1*b*c'])
})
// Oracle: evaluate the expression numerically with random values for free variables and compare to the result terms.
function evalExpr(expression, vals) {
  const js = tokenize(expression).map(t => (/^[a-z]+$/.test(t) ? `(${vals[t]})` : t)).join(' ')
  return Function(`return (${js})`)()
}
function evalTerms(terms, vals) {
  return terms.reduce((sum, t) => { const [c, ...vs] = t.split('*'); return sum + Number(c) * vs.reduce((p, v) => p * vals[v], 1) }, 0)
}
test('random expressions agree numerically and are ordered', () => {
  let seed = 11
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  const names = ['a', 'b', 'c']
  let checked = 0
  const gen = d => {
    if (d === 0 || rnd(3) === 0) return rnd(2) ? String(rnd(5)) : names[rnd(3)]
    const x = gen(d - 1), y = gen(d - 1)
    const op = '+-*'[rnd(3)]
    return rnd(2) ? `(${x}) ${op} (${y})`.replace(/\(([a-z0-9]+)\)/g, '$1') : `${x} ${op} ${y === '' ? '1' : y}`.replace(/\s+/g, ' ')
  }
  for (let t = 0; t < 200; t++) {
    const expression = gen(3).replace(/\(([a-z0-9]+)\)/g, '$1')
    let r
    try { r = run(expression, ['c'], [3]) } catch { continue }
    checked++
    const vals = { a: 2, b: -3, c: 3 }
    assert.equal(evalTerms(r.result, vals), evalExpr(expression, vals), expression)
    vals.a = 5; vals.b = 7
    assert.equal(evalTerms(r.result, vals), evalExpr(expression, vals), expression)
    assert.equal(r.frames.at(-1).phase, 'done')
  }
  assert.ok(checked > 100, `only ${checked} checked`)
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"expression":"a +","evalvars":[],"evalints":[]}'))
  assert.throws(() => parseInput('{"expression":"a","evalvars":["a"],"evalints":[]}'))
  assert.throws(() => parseInput('{"expression":"A","evalvars":[],"evalints":[]}'))
})
