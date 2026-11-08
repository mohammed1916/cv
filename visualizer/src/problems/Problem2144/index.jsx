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
    { label: 'Single candy', input: '[5]' },
    { label: 'Equal costs', input: '[6,6,6]' },
    { label: 'Largest cost', input: '[100,99,1]' },
    { label: 'Long run: 100 candies', input: '[26,78,100,91,94,66,25,76,99,99,8,64,99,93,33,90,11,35,51,31,23,54,35,11,14,26,37,90,85,38,21,59,72,12,14,35,79,54,53,78,46,69,42,40,24,48,93,76,42,16,93,60,48,85,71,30,37,43,55,94,10,6,81,74,23,73,84,88,28,9,9,1,73,10,100,96,97,4,81,43,57,78,71,92,1,29,71,4,72,41,45,71,43,61,45,68,38,14,78,12]' },
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
