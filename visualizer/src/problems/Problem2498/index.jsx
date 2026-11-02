import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2498',
  phases: [
    { id: 'setup', label: 'Setup', description: 'The first jump is between the first two stones.' },
    { id: 'gap', label: 'Gap', description: 'Measure the jump that skips one stone.' },
    { id: 'update', label: 'Update', description: 'Keep the largest jump so far.' },
    { id: 'done', label: 'Result', description: 'Return the largest jump.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"stones": [0,2,5,6,7]}',
  url: 'https://leetcode.com/problems/frog-jump-ii/',
  complexity: 'O(n) time and O(1) extra space for n stones. The visualization caps stones at 12.',
  examples: [
    { label: 'Example 1', input: '{"stones":[0,2,5,6,7]}' },
    { label: 'Example 2', input: '{"stones":[0,3,9]}' },
  ],
}

export default function FrogJumpII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="stones" length={run.input.stones.length} valueAt={i => run.input.stones[i]} active={step.at}
      roleAt={i => (step.from !== null && step.from >= 0 && (i === step.from || i === step.at) ? 'jump' : '')} />
    <output aria-label="Largest jump">{`best ${step.best}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The frog visits the even-indexed stones on the way out and the odd-indexed stones on the way back, so the jumps that matter skip exactly one stone.</p>
    <p>The largest such gap, together with the first jump, is the smallest possible maximum jump.</p>
  </>} />
}
