import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at index 0 with zero jumps.' },
    { id: 'pop', label: 'Expand', description: 'Look at the neighbours: one step left, one step right, and every index with the same value.' },
    { id: 'found', label: 'Last index', description: 'The last index is taken from the queue, so its distance is the answer.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of jumps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arr (integers from -20 to 20)',
  url: 'https://leetcode.com/problems/jump-game-iv/',
  complexity: 'O(n) time and space. Each value list is cleared after first use, so same-value jumps are scanned once.',
  examples: [
    { label: 'Example 1', input: '{"arr":[100,-23,-23,404,100,23,23,23,3,404]}' },
    { label: 'Example 2', input: '{"arr":[7,6,9,6,9,6,9,7]}' },
  ],
}

export default function JumpGameIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.current ?? -1}
      roleAt={i => (step.frontier.includes(i) ? 'frontier' : step.visited.includes(i) ? 'visited' : '')} />
    <output aria-label="Jumps">{`Jumps so far: ${step.jumps ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every move costs one jump and goes to a neighbour or to any index with the same value, so breadth-first order gives the fewest jumps.</p>
    <p>Once a value's index list has been used, every index on it is already reached at a distance no larger, so the list is cleared.</p>
  </>} />
}
