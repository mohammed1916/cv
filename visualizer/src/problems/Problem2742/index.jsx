import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const show = value => (value === Infinity ? '∞' : String(value))

const definition = {
  phases: [
    { id: 'start', label: 'Nothing covered', description: 'Covering zero walls costs nothing.' },
    { id: 'wall', label: 'Consider wall', description: 'Paying for this wall adds its coverage.' },
    { id: 'done', label: 'Complete', description: 'Report the cost of covering every wall.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cost and time arrays of equal length',
  url: 'https://leetcode.com/problems/painting-the-walls/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps input at 10 walls.',
  examples: [
    { label: 'Example 1', input: '{"cost":[1,2,3,2],"time":[1,2,3,2]}' },
    { label: 'Example 2', input: '{"cost":[2,3,4,2],"time":[1,1,1,1]}' },
    { label: 'Single task', input: '{"cost":[5],"time":[3]}' },
    { label: 'Equal costs and times', input: '{"cost":[4,4,4],"time":[2,2,2]}' },
    { label: 'Largest input', input: '{"cost":[100,100,100,100,100,100,100,100,100,100],"time":[10,10,10,10,10,10,10,10,10,10]}' },
    { label: 'Long run: 10 tasks', input: '{"cost":[4,77,74,99,76,69,82,87,84,41],"time":[6,7,6,5,6,9,8,1,8,5]}' },
  ],
}

export default function PaintingWalls() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cheapest cost to cover c walls (capped at n)" length={step.best.length} valueAt={index => show(step.best[index])} active={run.input.cost.length} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The paid painter's wall i takes time[i] units, and during that time the free painter can paint time[i] other walls.</p>
    <p>So a paid wall covers time[i] + 1 walls, and the question becomes the cheapest set of paid walls that covers every wall.</p>
  </>} />
}
