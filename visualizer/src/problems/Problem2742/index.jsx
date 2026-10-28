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
