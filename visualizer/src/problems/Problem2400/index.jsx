import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Origin', description: 'One sequence sits at displacement zero.' },
    { id: 'step', label: 'Step', description: 'Each displacement passes its count to both neighbours.' },
    { id: 'done', label: 'Complete', description: 'Read the count at the target displacement.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start_pos, end_pos and k (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps/',
  complexity: 'O(k^2) time. The visualization caps all values at 40.',
  examples: [
    { label: 'Example 1', input: '{"start_pos":1,"end_pos":2,"k":3}' },
    { label: 'Unreachable', input: '{"start_pos":2,"end_pos":5,"k":10}' },
  ],
}

export default function ExactSteps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { k: steps, start_pos: start, end_pos: end } = run.input
    const target = Math.min(run.width - 1, Math.max(0, end - start + steps))
    return <>
      <IndexedSequence label={`Counts by displacement after ${step.step} step(s)`} length={run.width}
        indexOffset={-steps} valueAt={i => step.row[i]} active={target}
        roleAt={i => (i === target ? 'target' : '')} />
      <output aria-label="Target">{`Target displacement ${end - start} after ${steps} steps`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each step moves one unit left or right, so after s steps the displacement lies between -s and s.</p>
    <p>Counting sequences by their current displacement lets the table stay small and never enumerates every sequence.</p>
  </>} />
}
