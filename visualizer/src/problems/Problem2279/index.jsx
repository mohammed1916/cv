import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Needs', description: 'Work out how many rocks each bag still needs.' },
    { id: 'fill', label: 'Fill', description: 'Fill the bag that needs the fewest rocks.' },
    { id: 'stop', label: 'Stop', description: 'The next bag needs more rocks than remain.' },
    { id: 'done', label: 'Complete', description: 'Report the number of full bags.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with capacity, rocks (same length, each at most its capacity) and additional_rocks',
  url: 'https://leetcode.com/problems/maximum-bags-with-full-capacity-of-rocks/',
  complexity: 'O(n log n) time for n bags. The visualization caps bags at 12.',
  examples: [
    { label: 'Example 1', input: '{"capacity":[2,3,4,5],"rocks":[1,2,4,4],"additional_rocks":2}' },
    { label: 'Example 2', input: '{"capacity":[10,2,2],"rocks":[2,2,0],"additional_rocks":100}' },
  ],
}

export default function MaximumBags() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bags (capacity, rocks)" length={run.input.capacity.length} valueAt={index => `${run.input.rocks[index]}/${run.input.capacity[index]}`} active={step.bag} />
    <output aria-label="Extra rocks">{`Extra rocks left: ${step.left}; full bags: ${step.full}`}</output>
  </>} renderReasoning={() => <>
    <p>Each bag needs capacity minus rocks more. Filling the bags with the smallest needs first gives the most full bags.</p>
    <p>Once a bag needs more than the rocks left, every later bag needs at least as much, so the loop can stop.</p>
  </>} />
}
