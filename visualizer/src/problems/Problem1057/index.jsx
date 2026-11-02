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
    { label: 'Two workers', input: '{"workers":[[0,0],[2,1]],"bikes":[[1,2],[3,3]]}' },
    { label: 'Three workers', input: '{"workers":[[0,0],[1,1],[2,0]],"bikes":[[1,0],[2,2],[2,1]]}' },
    { label: 'Tie on distance', input: '{"workers":[[0,0],[5,5]],"bikes":[[0,0],[5,5],[9,9]]}' },
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
