import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RoadLanesView from './RoadLanesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3466',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with lanes: two equal-length arrays of integers',
  url: 'https://leetcode.com/problems/maximum-coin-collection/',
  complexity: 'O(n^2) time and O(1) extra space for n miles: each entry mile runs a six-state table forward to the end of the road. Reading the statement as written, a route may exit only after at least one mile and may switch lanes at most twice.',
  examples: [
    { label: 'Out and back', input: '{"lanes":[[3,-2,4,-1],[1,5,-3,2]]}' },
    { label: 'Switch at entry', input: '{"lanes":[[-4,6,1],[2,-9,-5]]}' },
    { label: 'Two switches', input: '{"lanes":[[2,-3,4,-1,2],[-2,5,-6,3,-1]]}' },
  ],
}

export default function MaximumCoinCollectionVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoadLanesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
