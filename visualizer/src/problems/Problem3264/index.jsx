import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The array before any multiplication.' },
    { id: 'multiply', label: 'Multiply', description: 'Multiply the first smallest number by the multiplier.' },
    { id: 'done', label: 'Complete', description: 'Report the final array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": operations, "multiplier": factor}',
  url: 'https://leetcode.com/problems/final-array-state-after-k-multiplication-operations-i/',
  complexity: 'O(k * n) time with a linear scan per operation. The visualization caps input at 8 numbers and 10 operations.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,5,6],"k":5,"multiplier":2}' },
    { label: 'Example 2', input: '{"nums":[1,2],"k":3,"multiplier":4}' },
  ],
}

export default function FinalArrayStateI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="nums" length={step.values.length} valueAt={i => step.values[i]} active={step.picked} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each operation picks the first index holding the minimum, so ties are broken by position.</p>
    <p>The array has at most 8 entries in this visualization, so a linear scan per operation is clear and fast enough.</p>
  </>} />
}
