import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BikePlaneView from './BikePlaneView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1057',
  phases: [
    { id: 'list', label: 'List', description: 'Every worker and bike pair.' },
    { id: 'sort', label: 'Sort', description: 'Order pairs by distance and indices.' },
    { id: 'start', label: 'Setup', description: 'Nothing is assigned yet.' },
    { id: 'consider', label: 'Consider', description: 'Look at the next closest pair.' },
    { id: 'assign', label: 'Assign', description: 'Both the worker and the bike are free.' },
    { id: 'skip', label: 'Skip', description: 'The worker or the bike is already taken.' },
    { id: 'done', label: 'Result', description: 'Each worker has a bike.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with workers and bikes lists of [x, y] points',
  url: 'https://leetcode.com/problems/campus-bikes/description/',
  complexity: 'O(M * N log(M * N)) time for M workers and N bikes, from sorting all pairs; O(M * N) space. The visualization caps input at 6 workers, 8 bikes and coordinates 0 to 20; the official bounds are not verified.',
  examples: [
    { label: 'Two workers', input: '{"workers":[[1,1],[4,3]],"bikes":[[0,4],[5,0],[3,3]]}' },
    { label: 'Three workers', input: '{"workers":[[2,2],[6,1],[0,5]],"bikes":[[1,3],[4,4],[7,0],[3,6]]}' },
    { label: 'Tie on distance', input: '{"workers":[[0,0],[5,5]],"bikes":[[0,0],[5,5],[9,9]]}' },
    { label: 'One worker on a bike', input: '{"workers":[[0,0]],"bikes":[[0,0]]}' },
    { label: 'Workers share a spot', input: '{"workers":[[2,2],[2,2]],"bikes":[[2,2],[2,3]]}' },
    { label: 'Largest input: six workers, eight bikes', input: '{"workers":[[0,0],[20,20],[0,20],[20,0],[10,10],[5,5]],"bikes":[[0,0],[20,20],[0,20],[20,0],[10,10],[5,5],[1,1],[19,19]]}' },
    { label: 'Long run: six workers, eight bikes', input: '{"workers":[[5,2],[18,11],[17,7],[7,11],[5,1],[17,5]],"bikes":[[11,1],[17,1],[11,18],[14,15],[7,4],[12,4],[10,20],[1,0]]}' },
  ],
}

export default function CampusBikes() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BikePlaneView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each pair is taken in order of distance, so the closest free pairs are assigned first; a worker or bike is never used twice.</p>}
    />
  )
}
