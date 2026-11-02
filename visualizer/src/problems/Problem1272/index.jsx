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
