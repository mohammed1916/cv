import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import examples from '../../config/examples/brace-expansion-ii.js'
import { buildTrace } from './algorithm.js'

const source = readFileSync(new URL('./BraceExpansionIIVisualizer.jsx', import.meta.url), 'utf8')
// Exercise the actual dedicated renderer's trace producer without loading React/DOM.
const traceSource = source.slice(source.indexOf('function sorted('), source.indexOf('function PanelBody('))
const generateSteps = vm.runInNewContext(`${traceSource}\ngenerateSteps`)

test('1096 route retains its dedicated tree and Cartesian expansion panels', () => {
  const route = readFileSync(new URL('./index.jsx', import.meta.url), 'utf8')
  assert.match(route, /export \{ default \} from ["']\.\/BraceExpansionIIVisualizer["']/)
  assert.match(source, /<RecursiveCallTree\b/)
  assert.match(source, /<CartesianExpansion\b/)
})

for (const example of examples) {
  test(`dedicated playback: ${example.label}`, () => {
    const frames = JSON.parse(JSON.stringify(generateSteps(example.expression)))
    assert.ok(frames.length > 0)
    assert.equal(frames.at(-1).phase, 'done')
    assert.deepEqual(frames.at(-1).result, buildTrace(example.expression).result)
    assert.ok(frames.some(frame => frame.calls.length > 0), 'recursive call snapshots must exist')
    if (example.expression.includes('{')) {
      assert.ok(frames.some(frame => frame.calls.length > 1), 'nested calls must appear')
      assert.ok(frames.some(frame => frame.leftSet.length && frame.rightSet.length && frame.resultSet.length), 'Cartesian operands and result must appear')
    }
    for (const frame of frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= 29)
      assert.equal(typeof frame.message, 'string')
    }
  })
}
