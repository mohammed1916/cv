import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The values before any multiplication.' },
    { id: 'multiply', label: 'Multiply', description: 'Multiply the first smallest value by the multiplier.' },
    { id: 'done', label: 'Complete', description: 'Reduce every value modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": operations, "multiplier": factor}',
  url: 'https://leetcode.com/problems/final-array-state-after-k-multiplication-operations-ii/',
  complexity: 'O(n log n + n log k) time for the real limits, using a heap and one round-robin pass. The visualization simulates up to 30 operations exactly.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,5,6],"k":5,"multiplier":2}' },
    { label: 'Example 2', input: '{"nums":[1,2],"k":3,"multiplier":4}' },
  ],
}

export default function FinalArrayStateII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Values (exact)" length={step.values.length} valueAt={i => step.values[i]} active={step.picked} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Once the smallest value times the multiplier exceeds the largest value, each multiplication moves the smallest to the top, so the values take turns in sorted order.</p>
    <p>The answer is only needed modulo 1000000007, so the large powers are computed with modular exponentiation.</p>
  </>} />
}
