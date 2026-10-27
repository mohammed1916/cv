import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List the distances that can be the answer.' },
    { id: 'check', label: 'Test distance', description: 'Look for k points that are all at least this far apart.' },
    { id: 'done', label: 'Complete', description: 'Report the largest distance that works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Square (JSON object with side, points on its boundary as [x, y], and k)',
  url: 'https://leetcode.com/problems/maximize-the-distance-between-points-on-a-square/',
  complexity: 'O(log m) feasibility checks over m candidate distances, each a search over the points. The visualization caps input at 8 points.',
  examples: [
    { label: 'Two corners', input: '{"side":2,"points":[[0,0],[2,2]],"k":2}' },
    { label: 'Four corners', input: '{"side":2,"points":[[0,0],[0,2],[2,0],[2,2]],"k":4}' },
  ],
}

export default function SquareSpread() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Boundary points" length={run.input.points.length}
      valueAt={i => `(${run.input.points[i][0]}, ${run.input.points[i][1]})`}
      roleAt={i => (step.witness.includes(i) ? 'chosen' : '')} />
    <output aria-label="Status">{`Search range ${step.lo} to ${step.hi} over the candidates. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>If k points can be chosen with every pair at least d apart, then a smaller d also works. That monotone property allows binary search over the distances.</p>
    <p>The answer is always one of the pairwise Manhattan distances, so the search runs over that sorted list.</p>
  </>} />
}
