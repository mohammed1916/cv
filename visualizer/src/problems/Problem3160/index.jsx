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
    { label: 'Own case 1', input: '{"limit":5,"queries":[[2,5],[3,6],[2,4],[4,5]]}' },
    { label: 'Own case 2', input: '{"limit":5,"queries":[[1,2],[2,3],[3,3],[4,5],[5,6]]}' },
    { label: "Smallest limit", input: "{\"limit\":1,\"queries\":[[0,1]]}" },
    { label: "Same ball repeated", input: "{\"limit\":3,\"queries\":[[1,5],[1,5],[1,5]]}" },
    { label: "Long run: 30 queries", input: "{\"limit\":20,\"queries\":[[0,3],[5,9],[12,2],[7,7],[20,1],[3,3],[18,4],[9,9],[1,8],[15,6],[4,2],[11,11],[6,10],[2,14],[17,5],[8,1],[13,13],[10,7],[19,2],[14,9],[0,20],[16,3],[5,6],[12,12],[7,4],[3,16],[20,20],[9,1],[1,19],[18,8]]}" },
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
