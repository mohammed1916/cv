import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GardenBeautyView from './GardenBeautyView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1788',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with flowers (integer beauty values, with a repeated value)',
  url: 'https://leetcode.com/problems/maximize-the-beauty-of-the-garden/',
  complexity: 'O(n) time with one pass over the flowers and a map keyed by beauty value, plus O(n) for the prefix sums. The visualization caps the garden at 12 flowers.',
  examples: [
    { label: 'Keep positives', input: '{"flowers":[3,-5,3,4,3]}' },
    { label: 'Skip negatives', input: '{"flowers":[5,-9,5]}' },
  ],
}

export default function MaximizeGardenBeautyVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GardenBeautyView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>The best total for a right endpoint is its own value, plus the best earlier left endpoint with the same value, plus every positive flower between them.</p>
        </>
      )}
    />
  )
}
