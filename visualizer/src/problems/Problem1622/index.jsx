import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1622',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops, a list of [name, value] pairs (JSON)',
  url: 'https://leetcode.com/problems/fancy-sequence/',
  complexity: 'O(1) time for addAll and multAll, and O(log p) for append and getIndex because of one modular inverse or product. O(n) space for n appends.',
  examples: [
    { label: 'Mixed calls', input: JSON.stringify({ ops: [['append', 2], ['addAll', 3], ['append', 7], ['multAll', 2], ['getIndex', 0], ['addAll', 3], ['append', 10], ['multAll', 2], ['getIndex', 2], ['getIndex', 9]] }) },
    { label: 'Empty read', input: JSON.stringify({ ops: [['getIndex', 0], ['append', 5], ['getIndex', 0]] }) },
    { label: 'Big factor', input: JSON.stringify({ ops: [['append', 4], ['multAll', 1000], ['getIndex', 0]] }) },
  ],
}

export default function FancyWorkspace() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const snap = step.snapshot
    const focus = snap.op === 'getIndex' && !snap.done && snap.arg < snap.values.length ? snap.arg : -1
    return <>
      <IndexedSequence label="Real values" length={snap.values.length} valueAt={i => snap.values[i]} active={focus}
        roleAt={i => (snap.op === 'append' && i === snap.values.length - 1 ? 'new' : '')} />
      <output aria-label="Lazy state">{`Multiplier ${snap.mul}, offset ${snap.add}, raw stored ${snap.stored.join(', ') || 'none'}`}</output>
      <output aria-label="Answers">{`Answers so far: [${snap.results.join(', ')}]`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>addAll and multAll only change one shared multiplier and offset, so each one is constant time. Stored values are kept so that their real value is raw times the multiplier plus the offset, which is why appends divide out the current transform first.</p>
  </>} />
}
