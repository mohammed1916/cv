import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BikeMaskView from './BikeMaskView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1066',
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty bike set is reachable.' },
    { id: 'mask', label: 'Mask', description: 'Extend a reachable bike set with the next worker.' },
    { id: 'try', label: 'Try', description: 'Give the next worker one more free bike.' },
    { id: 'store', label: 'Store', description: 'A cheaper cost for this bike set.' },
    { id: 'full', label: 'Full', description: 'Every worker is seated on this bike set.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest full assignment.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with workers and bikes lists of [x, y] points',
  url: 'https://leetcode.com/problems/campus-bikes-ii/description/',
  complexity: 'O(2^M * M) time for M bikes and O(2^M) space, using a bitmask over bikes. The visualization caps input at 6 workers, 8 bikes and coordinates 0 to 20; the official bounds are not verified.',
  examples: [
    { label: 'Two workers', input: '{"workers":[[1,1],[4,3]],"bikes":[[0,4],[5,0],[3,3]]}' },
    { label: 'Three workers', input: '{"workers":[[2,2],[6,1],[0,5]],"bikes":[[1,3],[4,4],[7,0],[3,6]]}' },
    { label: 'Greedy trap', input: '{"workers":[[2,0],[3,1]],"bikes":[[3,0],[0,0]]}' },
    { label: 'One worker on a bike', input: '{"workers":[[0,0]],"bikes":[[0,0]]}' },
    { label: 'Workers share a spot', input: '{"workers":[[2,2],[2,2]],"bikes":[[2,2],[2,3]]}' },
    { label: 'Largest input: six workers, eight bikes', input: '{"workers":[[0,0],[20,20],[0,20],[20,0],[10,10],[5,5]],"bikes":[[0,0],[20,20],[0,20],[20,0],[10,10],[5,5],[1,1],[19,19]]}' },
    { label: 'Long run: six workers, eight bikes', input: '{"workers":[[5,2],[18,11],[17,7],[7,11],[5,1],[17,5]],"bikes":[[11,1],[17,1],[11,18],[14,15],[7,4],[12,4],[10,20],[1,0]]}' },
  ],
}

export default function CampusBikesII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BikeMaskView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each bike set remembers the cheapest way to seat the first workers on exactly those bikes, so every global choice is compared rather than just the nearest pair.</p>}
    />
  )
}
