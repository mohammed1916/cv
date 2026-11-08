import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No points processed yet.' },
    { id: 'point', label: 'Point j', description: 'Drop stale candidates, pair with the front, then keep this point as a candidate.' },
    { id: 'done', label: 'Complete', description: 'Report the best equation value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"points": [[x, y], ...] (x increasing), "k": 1-10}',
  url: 'https://leetcode.com/problems/max-value-of-equation/',
  complexity: 'O(n) time with a deque of candidate indices, O(n) space. The visualization caps input at 12 points.',
  examples: [
    { label: 'Example 1', input: '{"points":[[1,3],[2,0],[5,10],[6,-10]],"k":1}' },
    { label: 'Example 2', input: '{"points":[[0,0],[3,0],[9,2]],"k":3}' },
    { label: 'Two points', input: '{"points":[[0,0],[1,5]],"k":1}' },
    { label: 'Even spacing', input: '{"points":[[0,0],[2,1],[4,2],[6,3]],"k":2}' },
    { label: 'Coordinate limits', input: '{"points":[[-10,10],[-9,-10],[0,10],[10,-10]],"k":10}' },
    { label: 'Long run: 11 points', input: '{"points":[[-10,-10],[-8,-1],[-6,-2],[-4,1],[-2,10],[0,-3],[2,9],[4,2],[6,-8],[8,1],[10,-6]],"k":2}' },
  ],
}

export default function MaxValueOfEquation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pts = run.input.points
    return <>
      <IndexedSequence label="Points (x, y) with deque marked" length={pts.length} active={step.j ?? -1}
        valueAt={i => `(${pts[i][0]}, ${pts[i][1]})`} roleAt={i => (i === step.j ? 'r' : step.queue[0] === i ? 'l' : step.queue.includes(i) ? 'window' : '')} />
      <output aria-label="Deque">{`Candidates (front first): [${step.queue.join(', ')}]`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>For a fixed j, the value y_i minus x_i is the part of the equation that depends on the earlier point i.</p>
    <p>Candidates with a smaller or equal value and a later index are never better, so the deque keeps them in decreasing order.</p>
  </>} />
}
