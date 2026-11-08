import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty argument list.' },
    { id: 'fill', label: 'Fill', description: 'A placeholder takes the next call argument.' },
    { id: 'keep', label: 'Keep', description: 'A bound value stays where it is.' },
    { id: 'rest', label: 'Append', description: 'Extra call arguments go to the end.' },
    { id: 'done', label: 'Result', description: 'fn is called with the final list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"bound": [1, "_", 3], "call": [2]}',
  url: 'https://leetcode.com/problems/partial-function-with-placeholders/',
  complexity: 'O(b + c) time for b bound values and c call arguments, with a fresh list for every call.',
  examples: [
    { label: 'Two holes, one extra', input: '{"bound":[1,"_",3,"_"],"call":[2,4,5]}' },
    { label: 'Leading hole', input: '{"bound":["_","x"],"call":[9]}' },
    { label: 'Empty bound and call', input: '{"bound":[],"call":[]}' },
    { label: 'Equal values in both lists', input: '{"bound":[1,1],"call":[1]}' },
    { label: 'Boundary: six and six values', input: '{"bound":["_","_","_","_","_","_"],"call":[null,true,"x",1,2,3]}' },
    { label: 'Long run: six mixed values', input: '{"bound":[1,"b",true,null,2,"_"],"call":["c",3,false,4,"_",5]}' },
  ],
}

export default function PartialFunctionWithPlaceholders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bound arguments" length={run.input.bound.length} valueAt={i => JSON.stringify(run.input.bound[i])} active={step.filled}
      roleAt={i => (run.input.bound[i] === '_' ? (i === step.filled ? 'filled now' : 'placeholder') : 'fixed')} />
    <IndexedSequence label="Call arguments" length={run.input.call.length} valueAt={i => JSON.stringify(run.input.call[i])} active={step.i < run.input.call.length ? step.i : -1}
      roleAt={i => (i < step.i ? 'used' : '')} />
    <output aria-label="Final argument list">{`fn receives [${step.out.map(v => JSON.stringify(v)).join(', ')}]`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each placeholder "_" in the bound list is replaced by the next call argument, in order. Call arguments left over are appended after the bound list.</p>
    <p>Every call builds a new list, so the bound list is not changed and later calls start fresh.</p>
  </>} />
}
