import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty sequence, multiplier 1 and offset 0.' },
    { id: 'append', label: 'Append', description: 'Store the value so that it reads correctly under the current multiplier and offset.' },
    { id: 'addAll', label: 'addAll', description: 'Add to the offset instead of touching every value.' },
    { id: 'multAll', label: 'multAll', description: 'Scale the multiplier and offset instead of touching every value.' },
    { id: 'getIndex', label: 'getIndex', description: 'Apply the multiplier and offset to the stored value at the index.' },
    { id: 'done', label: 'Complete', description: 'Report every getIndex answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops, a list of [name, value] pairs (JSON)',
  url: 'https://leetcode.com/problems/fancy-sequence/',
  complexity: 'O(1) time per append, addAll and multAll, plus one modular inverse (O(log p)) per append, and O(log p) per getIndex. O(n) space for n appends. The visualization caps the operation list at 40 calls.',
  examples: [
    { label: 'Illustrative input (not from the statement)', input: '{"ops":[["append",2],["addAll",3],["append",7],["multAll",2],["getIndex",0],["addAll",3],["append",10],["multAll",2],["getIndex",2],["getIndex",9]]}' },
  ],
}

export default function FancyWorkspace() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Real values" length={step.length} valueAt={i => step.values[i]} active={step.op === 'getIndex' && !step.done && step.arg < step.length ? step.arg : -1}
      roleAt={i => (step.op === 'append' && i === step.length - 1 ? 'new' : '')} />
    <output aria-label="Lazy state">{`Multiplier ${step.mul}, offset ${step.add}, raw stored ${step.stored.join(', ') || 'none'}`}</output>
    <output aria-label="Answers">{`Answers so far: [${step.results.join(', ')}]`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>addAll and multAll only change one shared multiplier and offset, so each one is constant time. Stored values are kept so that their real value is raw times the multiplier plus the offset, which is why appends divide out the current transform first.</p>
  </>} />
}
