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
    { label: 'Example 1', input: '{"vals":[1,2,3,4,10,-10,-20],"edges":[[0,1],[1,2],[1,3],[3,4],[3,5],[3,6]],"k":2}' },
    { label: 'Example 2', input: '{"vals":[-5],"edges":[],"k":0}' },
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
