import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Collect', description: 'Find the non-negative positions and values.' },
    { id: 'write', label: 'Write back', description: 'Write each rotated value into its slot.' },
    { id: 'done', label: 'Complete', description: 'Report the rotated array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and shift (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/rotate-non-negative-elements/',
  complexity: 'O(n) time and O(n) space. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,-2,3,-4],"k":3}' },
    { label: 'Example 3', input: '{"nums":[5,4,-9,6],"k":2}' },
  ],
}

export default function RotateNonNegativeElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Array" length={step.out.length} valueAt={i => step.out[i]} active={step.index}
      roleAt={i => (run.positions.includes(i) ? 'non-negative' : 'fixed')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Negative values keep their indexes. Only the non-negative values rotate, and the shift is taken modulo how many there are.</p>
  </>} />
}
