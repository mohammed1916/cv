import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PointSweepView from './PointSweepView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2613',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Sort the points by x and empty the trees.' },
    { id: 'point', label: 'Sweep', description: 'Take the next point from the left.' },
    { id: 'queryA', label: 'Query A', description: 'Look for a partner below this point.' },
    { id: 'queryB', label: 'Query B', description: 'Look for a partner above this point.' },
    { id: 'record', label: 'Record', description: 'Keep a closer or lexicographically smaller pair.' },
    { id: 'insert', label: 'Insert', description: 'Add this point to both trees.' },
    { id: 'done', label: 'Result', description: 'Report the beautiful pair.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums1 and nums2 (same length, 2 to 8 points)',
  url: 'https://leetcode.com/problems/beautiful-pairs/',
  complexity: 'O(n log n) time and O(n) space for n points: each point makes two Fenwick-tree queries and two updates. Ties are broken by the smallest index pair. The visualization caps n at 8 and coordinates at -9..9; the official limits are larger.',
  examples: [
    { label: 'Five points', input: '{"nums1":[1,4,2,7,5],"nums2":[3,1,6,2,4]}' },
    { label: 'Diagonal', input: '{"nums1":[0,3,6,9],"nums2":[0,3,6,9]}' },
    { label: 'Tie breaking', input: '{"nums1":[2,2,8],"nums2":[5,5,5]}' },
  ],
}

export default function BeautifulPairs() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PointSweepView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Points left of the current one are split by height: those below use x + y, those above use x - y.</p>}
    />
  )
}
