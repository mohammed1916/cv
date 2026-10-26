import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('591 official examples', () => {
  assert.equal(buildTrace('<DIV>This is the first line <![CDATA[<div>]]></DIV>').result, true)
  assert.equal(buildTrace('<DIV>>>  ![cdata[]] <![CDATA[<div>]>]]>]]>>]</DIV>').result, true)
  assert.equal(buildTrace('<A>  <B> </A>   </B>').result, false)
  assert.equal(buildTrace('<DIV>  div tag is not closed  <DIV>').result, false)
})

test('591 generated well-formed codes are valid and single-character corruptions are caught', () => {
  let state = 99
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const names = ['A', 'BB', 'CCC']
  function gen(depth) {
    const name = names[rand(3)]
    let body = ''
    const parts = rand(3)
    for (let p = 0; p < parts; p++) body += depth < 3 && rand(2) ? gen(depth + 1) : 'x'
    return `<${name}>${body}</${name}>`
  }
  for (let t = 0; t < 300; t++) {
    const code = gen(0)
    assert.equal(buildTrace(code).result, true, code)
    const broken = code.replace(/<\//, '<')
    assert.equal(buildTrace(broken).result, false, broken)
  }
})

test('591 rejects non-string input', () => {
  assert.throws(() => parseInput('[1]'))
})
