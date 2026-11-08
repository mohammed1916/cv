import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'No box is chosen yet.' },
    { id: 'skip', label: 'Skip', description: 'The box is too small for the item.' },
    { id: 'take', label: 'Take', description: 'This box is the tightest fit so far.' },
    { id: 'keep', label: 'Keep', description: 'The earlier box is no larger.' },
    { id: 'done', label: 'Result', description: 'Report the chosen box.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with capacity and itemSize',
  url: 'https://leetcode.com/problems/minimum-capacity-box/',
  complexity: 'One pass over the boxes, so O(n) time and O(1) extra space. The visual caps the list at 12 boxes.',
  examples: [
    { label: 'Example', input: '{"capacity":[9,4,6,4],"itemSize":5}' },
    { label: 'Tie', input: '{"capacity":[7,7,7],"itemSize":7}' },
    { label: 'Single box', input: '{"capacity":[5],"itemSize":3}' },
    { label: 'Equal capacities', input: '{"capacity":[4,6,4,6],"itemSize":4}' },
    { label: 'Zero item size', input: '{"capacity":[0,0,3],"itemSize":0}' },
    { label: 'No box fits', input: '{"capacity":[1,2,3],"itemSize":9}' },
    { label: 'Long run: 12 boxes', input: '{"capacity":[41,48,20,99,67,27,43,17,84,56,32,82],"itemSize":37}' },
  ],
}

export default function MinimumCapacityBox() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="capacity" length={run.input.capacity.length} valueAt={i => run.input.capacity[i]} active={step.i ?? -1}
      roleAt={i => (i === step.best ? 'best' : run.input.capacity[i] < run.input.itemSize ? 'small' : '')} />
    <output aria-label="Best box">{step.best === -1 ? 'No box chosen yet' : `Best box: ${step.best} (capacity ${run.input.capacity[step.best]})`}</output>
  </>} renderReasoning={() => <>
    <p>Only boxes with capacity at least the item size can be used, and among those the smallest capacity wastes the least room.</p>
    <p>Keeping the earliest box on ties is achieved by replacing the best only on a strictly smaller capacity.</p>
  </>} />
}
