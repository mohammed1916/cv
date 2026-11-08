import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The first position starts the walk with its own value.' },
    { id: 'visit', label: 'Visit position', description: 'Pick the earlier position that leaves the best score after any parity penalty.' },
    { id: 'done', label: 'Complete', description: 'Report the best score at any position.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and x (JSON)',
  url: 'https://leetcode.com/problems/visit-array-positions-to-maximize-score/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps n at 10.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[3,4,7,2,10,3],"x":6}' },
    { label: 'Example 2', input: '{"nums":[2,4,6],"x":1}' },
    { label: 'Single value equal to x', input: '{"nums":[4],"x":4}' },
    { label: 'Equal values', input: '{"nums":[5,5,5],"x":5}' },
    { label: 'Boundary: 20 and 1', input: '{"nums":[20,1,20,1,20,1,20,1,20,1],"x":20}' },
    { label: 'Long run: 10 values', input: '{"nums":[14,9,12,16,7,13,3,17,3,20],"x":7}' },
  ],
}

export default function VisitArrayPositions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Best score ending at each position" length={run.input.nums.length} valueAt={i => (step.best[i] === null ? '-' : step.best[i])}
      active={step.index} roleAt={i => (step.from >= 0 && i === step.from ? 'from' : '')} />
    <output aria-label="Move">{step.from >= 0 ? `Position ${step.index} comes from ${step.from}` : `Values ${run.input.nums.join(', ')} with penalty ${run.input.x}`}</output>
  </>} renderReasoning={() => <>
    <p>Moving forward from an earlier position adds the current value, and changing parity costs x. The best score at a position comes from the best earlier position after its penalty.</p>
    <p>Keeping the best score per position means each choice reuses a result that is already known.</p>
  </>} />
}
