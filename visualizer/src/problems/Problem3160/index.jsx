import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty maps', description: 'No ball has a color yet.' },
    { id: 'repaint', label: 'Old color', description: 'Remove the ball from its old color’s count.' },
    { id: 'paint', label: 'New color', description: 'Paint the ball and record the distinct count.' },
    { id: 'done', label: 'Answers', description: 'Return the distinct count after each query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Limit and queries as JSON: {"limit": n, "queries": [[ball, color], ...]}',
  url: 'https://leetcode.com/problems/find-the-number-of-distinct-colors-among-the-balls/',
  complexity: 'O(1) time per query with two hash maps, and O(q) total time. The visualization caps input at 30 queries.',
  examples: [
    { label: 'Example 1', input: '{"limit":4,"queries":[[1,4],[2,5],[1,3],[3,4]]}' },
    { label: 'Example 2', input: '{"limit":4,"queries":[[0,1],[1,2],[2,2],[3,4],[4,5]]}' },
  ],
}

export default function DistinctBallColors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Distinct colors so far">{`Answers so far: [${step.result.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A repaint changes at most two counts: the old color loses one ball and the new color gains one. A color with zero balls is removed, so the map size is the distinct count.</p>
    <p>Keeping the counts in a map means no query has to rescan the balls.</p>
  </>} />
}
