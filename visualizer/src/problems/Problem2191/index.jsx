import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MappingView from './MappingView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2191',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with mapping and nums, e.g. {"mapping":[8,3,4,0,2,1,3,5,7,6],"nums":[991,338,38]}',
  url: 'https://leetcode.com/problems/sort-the-jumbled-numbers/',
  complexity: 'O(n * d + n log n) time for n numbers with d digits each, and O(n) extra space. The page caps the list at 8 numbers below 100000.',
  examples: [
    { label: 'Shuffled digits', input: '{"mapping":[8,3,4,0,2,1,3,5,7,6],"nums":[991,338,38]}' },
    { label: 'Identity mapping', input: '{"mapping":[0,1,2,3,4,5,6,7,8,9],"nums":[789,456,123]}' },
    { label: 'Ties keep order', input: '{"mapping":[0,0,0,0,0,0,0,0,0,0],"nums":[5,0,7]}' },
  ],
}

export default function Problem2191Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MappingView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
