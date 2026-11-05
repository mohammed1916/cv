import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2239',
  phases: [
    { id: 'setup', label: 'Start', description: 'Start with the first value as the best.' },
    { id: 'scan', label: 'Compare', description: 'Compare each value by distance from zero, breaking ties upward.' },
    { id: 'done', label: 'Result', description: 'Return the best value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [-6, 5, -2, 9]}',
  url: 'https://leetcode.com/problems/find-closest-number-to-zero/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '{"nums":[-6,5,-2,9]}' },
    { label: 'Tie', input: '{"nums":[4,-4,7]}' },
  ],
}

export default function ClosestToZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (run.input.nums[i] === step.best && i <= Math.max(step.at, 0) ? 'best' : '')} />
    <output aria-label="Best so far">{`best ${step.best}, distance ${Math.abs(step.best)}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Distance from zero decides the winner. When two values share the same distance, the problem asks for the larger one, so the comparison breaks ties upward.</p>
  </>} />
}
