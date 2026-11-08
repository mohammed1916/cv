import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Graph', description: 'Build the neighbour list of every node.' },
    { id: 'center', label: 'Center', description: 'Pick the k best positive neighbours of one center.' },
    { id: 'done', label: 'Complete', description: 'Report the best star.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with vals, edges (pairs of node numbers) and k',
  url: 'https://leetcode.com/problems/maximum-star-sum-of-a-graph/',
  complexity: 'O(m log m) time for m edges. The visualization caps the graph at ten nodes.',
  examples: [
    { label: 'Own case 1', input: '{"vals":[-20,-10,10,4,3,2,1],"edges":[[3,6],[3,5],[3,4],[1,3],[1,2],[0,1]],"k":2}' },
    { label: 'Own case 2', input: '{"vals":[-6],"edges":[],"k":1}' },
    { label: 'Single node, k = 1', input: '{"vals":[7],"edges":[],"k":1}' },
    { label: 'Equal values', input: '{"vals":[5,5,5],"edges":[[0,1],[0,2]],"k":1}' },
    { label: 'Extreme values, k = 10', input: '{"vals":[100,-100,100,-100,100,-100,100,-100,100,-100],"edges":[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9]],"k":10}' },
    { label: 'Long run: 10 nodes', input: '{"vals":[50,82,-93,0,-12,-2,47,94,63,19],"edges":[[3,2],[6,7],[9,7],[8,0],[6,4],[5,0],[5,7],[6,1],[6,5],[0,3],[9,1],[0,1],[0,7],[1,4],[6,2]],"k":4}' },
  ],
}

export default function MaximumStarSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.vals.length} valueAt={index => run.input.vals[index]} active={step.index} roleAt={index => (step.marked.includes(index) ? 'neighbour' : '')} />
    <output aria-label="Best star sum">{`Best star sum so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A star uses one center and at most k of its edges. Only positive neighbour values can help the sum.</p>
    <p>For each center, sort its neighbours by value and take the largest positive ones up to k.</p>
  </>} />
}
