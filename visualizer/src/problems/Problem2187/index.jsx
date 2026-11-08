import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SearchView from './SearchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2187',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with time and totalTrips, e.g. {"time":[1,2,3],"totalTrips":5}',
  url: 'https://leetcode.com/problems/minimum-time-to-complete-trips/',
  complexity: 'O(n log(max time)) time for n buses with a binary search on the answer, and O(1) extra space. The page caps buses at 6, times at 9 and trips at 30.',
  examples: [
    { label: 'Three buses', input: '{"time":[1,2,3],"totalTrips":5}' },
    { label: 'Single bus', input: '{"time":[2],"totalTrips":1}' },
    { label: 'Equal buses', input: '{"time":[1,1,1],"totalTrips":4}' },
    { label: 'One bus', input: '{"time":[4],"totalTrips":3}' },
    { label: 'Identical buses', input: '{"time":[2,2,2],"totalTrips":6}' },
    { label: 'Largest times and trips', input: '{"time":[9,9,9,9,9,9],"totalTrips":30}' },
    { label: 'Long run: six buses', input: '{"time":[5,3,9,6,7,1],"totalTrips":30}' },
  ],
}

export default function Problem2187Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SearchView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
