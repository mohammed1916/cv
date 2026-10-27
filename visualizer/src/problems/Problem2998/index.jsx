import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Put x in the queue at distance 0.' },
    { id: 'visit', label: 'Expand', description: 'Take the next value and list the values one operation away.' },
    { id: 'found', label: 'Found', description: 'The value y has been reached at its smallest distance.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x and y (1 to 200 each)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-x-and-y-equal/',
  complexity: 'O(L) time for a search over L bounded values, where L is about 10 times the larger input. The visualization caps x and y at 200.',
  examples: [
    { label: 'Example 1', input: '{"x":26,"y":1}' },
    { label: 'Example 2', input: '{"x":54,"y":2}' },
  ],
}

export default function EqualWithOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <dl aria-label="Search state">
      <dt>Target y</dt><dd>{run.input.y}</dd>
      <dt>Current value</dt><dd>{step.value ?? '-'}</dd>
      <dt>Operations so far</dt><dd>{step.distance ?? '-'}</dd>
      <dt>Waiting in queue</dt><dd>{step.queued}</dd>
    </dl>
    {step.moves && <output aria-label="Moves">{`Moves from here: ${step.moves.join(', ')}`}</output>}
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each operation changes the value by one or divides it by 5 or 11, so a breadth-first search explores values in order of how many operations they need.</p>
    <p>The first time y is taken from the queue, its distance is the fewest operations. Values are kept inside a bounded range so the search finishes.</p>
  </>} />
}
