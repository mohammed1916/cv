import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const show = value => (value === Infinity ? '∞' : String(value))

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero boxes need zero trips.' },
    { id: 'end', label: 'End at box i', description: 'Choose the trip that ends at this box.' },
    { id: 'trip', label: 'Try a start', description: 'Price the trip that starts at an earlier box.' },
    { id: 'limit', label: 'Limit reached', description: 'The ship cannot carry more boxes or weight.' },
    { id: 'done', label: 'Complete', description: 'Report the trips needed for every box.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with boxes [[port, weight], ...], ports_count, max_boxes, max_weight',
  url: 'https://leetcode.com/problems/delivering-boxes-from-storage-to-ports/',
  complexity: 'O(n * min(n, max_boxes)) time and O(n) space. The visualization caps input at 8 boxes.',
  examples: [
    { label: 'Example 1', input: '{"boxes":[[1,1],[2,1],[1,1]],"ports_count":2,"max_boxes":3,"max_weight":3}' },
    { label: 'Example 2', input: '{"boxes":[[1,2],[3,3],[3,1],[3,1],[2,4]],"ports_count":3,"max_boxes":3,"max_weight":6}' },
  ],
}

export default function DeliveringBoxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Fewest trips for each prefix" length={step.trips.length} valueAt={index => show(step.trips[index])} active={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Boxes must be delivered in order, so every trip carries a consecutive block of boxes.</p>
    <p>A trip costs 2 for the trip from and back to storage, plus one for each change of port between neighbouring boxes in the block.</p>
    <p>The table value for prefix i is the cheapest of these costs over every legal starting box.</p>
  </>} />
}
