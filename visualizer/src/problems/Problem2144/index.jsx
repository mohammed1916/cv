import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2144',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Candy costs as a JSON array',
  url: 'https://leetcode.com/problems/minimum-cost-of-buying-candies-with-discount/',
  complexity: 'O(n log n) time for the sort; O(n) space for the sorted copy.',
  examples: [
    { label: 'Two groups', input: '[4,8,2,6,1,9,3]' },
    { label: 'Exactly one group', input: '[10,3,7]' },
  ],
}

export default function Problem2144Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Costs, highest first (every third is free)" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.i} roleAt={i => (step.free.includes(i) ? 'free' : i <= step.i ? 'paid' : '')} />
          <p>Paid so far: {step.total}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
