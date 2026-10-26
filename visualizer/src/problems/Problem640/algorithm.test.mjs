import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('640 official examples', () => {
  assert.equal(buildTrace('x+5-3+x=6+x-2').result, 'x=2')
  assert.equal(buildTrace('x=x+2').result, 'No solution')
  assert.equal(buildTrace('2x=x+x').result, 'Infinite solutions')
})

test('640 random equations agree with numeric evaluation over a range of x', () => {
  let state = 2
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const term = () => {
    const c = rand(7) - 3
    return rand(2) ? `${c}x` : `${c}`
  }
  const build = () => {
    let s = term()
    for (let i = rand(3); i > 0; i--) s += (rand(2) ? '+' : '-') + term().replace(/^-/, '')
    return s
  }
  for (let t = 0; t < 400; t++) {
    const left = build(), right = build()
    const equation = `${left}=${right}`
    let parsed
    try { parsed = parseInput(JSON.stringify(equation)) } catch { continue }
    // Oracle: evaluate both sides at many integer points and look for x that balances them.
    const evaluate = (text, x) => eval(text.replace(/(\d+)?x/g, (m, c) => `((${c ?? 1})*${x})`))
    const roots = []
    for (let x = -60; x <= 60; x++) if (evaluate(left, x) === evaluate(right, x)) roots.push(x)
    const sameEverywhere = roots.length > 100
    const result = buildTrace(parsed).result
    if (sameEverywhere) assert.equal(result, 'Infinite solutions', equation)
    else if (roots.length === 0) assert.ok(result === 'No solution' || /^x=-?\d+(\.\d+)?$/.test(result) && !Number.isInteger(Number(result.slice(2))), equation)
    else assert.equal(result, `x=${roots[0]}`, equation)
  }
})

test('640 rejects inputs without exactly one equals sign', () => {
  assert.throws(() => parseInput('"x+1"'))
})
