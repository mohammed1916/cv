import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ContextBindingView from './ContextBindingView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, FUNCTIONS } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: `Object with fn (${Object.keys(FUNCTIONS).join(', ')}) and args, whose first entry is the context`,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(1) work beyond the function itself. The input picks from sample functions rather than running typed code; the context is capped at 12 keys here.',
  examples: [
    { label: 'Read a field', input: '{"fn":"discount","args":[{"price":80},0.25]}' },
    { label: 'Two parameters', input: '{"fn":"badge","args":[{"name":"Mira"},"<",">"]}' },
    { label: 'Change the object', input: '{"fn":"bump","args":[{"hits":3},4]}' },
    { label: 'Symbol stays hidden', input: '{"fn":"keyCount","args":[{"red":1,"blue":2}]}' },
    { label: 'Array as context', input: '{"fn":"lastItem","args":[[5,6,9]]}' },
    { label: 'Missing property', input: '{"fn":"readOwner","args":[{"city":"Oslo"}]}' },
  ],
}

export default function CallFunctionWithCustomContext() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ContextBindingView run={run} step={step} />} renderReasoning={() => <>
    <p>In JavaScript, this is decided by how a function is called, not where it was written. A call written as object[key](...) runs with this set to that object.</p>
    <p>So the function is placed on the context for a moment and called from there. A fresh Symbol is the key because it cannot equal any existing key, and Object.keys does not list it, so the function cannot notice it.</p>
    <p>The key is deleted afterwards, but changes the function made through this remain, because this was the real object. The Python tab shows the same idea using a bound method, where the object arrives as self.</p>
  </>} />
}
