import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TripGraphView from './TripGraphView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2247',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n, edges ([a, b, cost]) and k',
  url: 'https://leetcode.com/problems/maximum-cost-of-trip-with-k-highways/',
  complexity: 'O(2^n * n^2) time and O(2^n * n) space for the bitmask table. The visualization caps the graph at 6 cities; the draft does not verify the official limits. Parallel highways keep only the largest cost.',
  examples: [
    { label: 'k = 2', input: '{"n":4,"edges":[[0,1,3],[1,2,5],[2,3,2],[1,3,7]],"k":2}' },
    { label: 'k = 3', input: '{"n":4,"edges":[[0,1,3],[1,2,5],[2,3,2],[1,3,7]],"k":3}' },
    { label: 'Too many highways', input: '{"n":4,"edges":[[0,1,3],[1,2,5],[2,3,2],[1,3,7]],"k":4}' },
  ],
}

export default function Problem2247Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripGraphView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
