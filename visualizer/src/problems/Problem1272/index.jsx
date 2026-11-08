import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RemoveIntervalView from './RemoveIntervalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1272',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with intervals ([start, end] pairs, sorted and disjoint) and toBeRemoved ([start, end])',
  url: 'https://leetcode.com/problems/remove-interval/description/',
  complexity: 'O(n) time and O(n) output for n intervals. The visualization caps n at 12 intervals and coordinates at 0 to 30; the draft does not verify the official bounds.',
  examples: [
    { label: 'Split one interval', input: '{"intervals":[[0,2],[3,5],[6,9]],"toBeRemoved":[1,4]}' },
    { label: 'Fully removed', input: '{"intervals":[[0,5]],"toBeRemoved":[0,5]}' },
    { label: 'Middle cut', input: '{"intervals":[[0,10]],"toBeRemoved":[3,5]}' },
    { label: 'No overlap', input: '{"intervals":[[0,1]],"toBeRemoved":[5,6]}' },
    { label: 'Remove everything', input: '{"intervals":[[0,10],[10,20],[20,30]],"toBeRemoved":[0,30]}' },
    { label: 'Full neighbour removed', input: '{"intervals":[[0,4],[4,8]],"toBeRemoved":[4,8]}' },
    { label: 'Long run: 12 intervals', input: '{"intervals":[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23]],"toBeRemoved":[5,17]}' },
  ],
}

export default function Problem1272Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RemoveIntervalView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
