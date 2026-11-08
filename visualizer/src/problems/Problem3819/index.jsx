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
    { label: 'Mixed signs, k four', input: '{"nums":[-3,5,0,2,-1],"k":4}' },
    { label: 'Single value, k zero', input: '{"nums":[9],"k":0}' },
    { label: 'One value', input: '{"nums":[-1],"k":0}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"k":2}' },
    { label: 'Alternating extremes', input: '{"nums":[9,-9,9,-9,9,-9,9,-9,9,-9,9,-9],"k":20}' },
    { label: 'Long run: 12 values', input: '{"nums":[-9,8,-3,2,9,6,-8,-7,-3,-6,-7,5],"k":7}' },
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
