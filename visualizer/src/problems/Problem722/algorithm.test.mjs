import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('722 official examples', () => {
  assert.deepEqual(buildTrace(['/*Test program */', 'int main()', '{ ', '  // variable declaration ', 'int a, b, c;', '/* This is a test', '   multiline  ', '   comment for ', '   testing */', 'a = b + c;', '}']).result,
    ['int main()', '{ ', '  ', 'int a, b, c;', 'a = b + c;', '}'])
  assert.deepEqual(buildTrace(['a/*comment', 'line', 'more_comment*/b']).result, ['ab'])
})

test('722 output never contains comment markers and keeps non-comment characters in order', () => {
  let state = 233
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const pieces = ['x', ' ', '/', '*', '//', '/*', '*/']
  for (let t = 0; t < 300; t++) {
    const source = Array.from({ length: 1 + rand(4) }, () => Array.from({ length: rand(8) }, () => pieces[rand(pieces.length)]).join(''))
    const result = buildTrace(source).result
    assert.ok(result.every(line => line.length > 0), 'no empty lines are emitted')
    assert.ok(result.every(line => !line.includes('//') && !line.includes('/*') && !line.includes('*/')), JSON.stringify({ source, result }))
  }
})

test('722 rejects non-array input', () => {
  assert.throws(() => parseInput('"x"'))
})
