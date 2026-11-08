import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PulseRotationView from './PulseRotationView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4058',
  phases: [
    { id: 'setup', label: 'Signs', description: 'Compute the unchanged pulse and prefix sums.' },
    { id: 'extend', label: 'Add left end', description: 'Make the previous index available as a left end.' },
    { id: 'candidate', label: 'Gain', description: 'Measure the best rotation that ends here.' },
    { id: 'record', label: 'Record', description: 'Keep the rotation with the larger gain.' },
    { id: 'done', label: 'Result', description: 'Report the greatest pulse.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers, e.g. [3, 1, 4, 1, 5]',
  url: 'https://leetcode.com/problems/maximum-pulse-value-after-one-subarray-rotation/',
  complexity: 'O(n) time and O(n) space for the prefix sums. The visualization caps the array at 16 values; the official limit is 100000.',
  examples: [
    { label: 'Rotation helps', input: '[1, 2]' },
    { label: 'No rotation', input: '[5, 1]' },
    { label: "Single value", input: "[0]" },
    { label: "Equal values", input: "[3,3,3]" },
    { label: "Extreme values", input: "[-1000000000,1000000000]" },
    { label: "Long run: 16 values", input: "[-817569072,-876642752,-422255244,-682875257,928477185,522188142,543788943,-763921476,746438795,-652943389,-230301327,-875341796,376197779,-557042264,-987133910,59078137]" },
  ],
}

export default function MaximumPulseVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PulseRotationView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Greatest pulse: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
