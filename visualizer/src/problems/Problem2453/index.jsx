import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2453',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with no residue groups.' },
    { id: 'scan', label: 'Group', description: 'Place each target in the group for its remainder.' },
    { id: 'choose', label: 'Choose', description: 'Compare each group with the best so far.' },
    { id: 'done', label: 'Result', description: 'Return the smallest seed in the best group.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [4,9,2,11,6], "space": 3}',
  url: 'https://leetcode.com/problems/destroy-sequential-targets/',
  complexity: 'O(n) expected time with a hash map of remainders, for n targets. The visualization caps nums at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,9,2,11,6],"space":3}' },
    { label: 'Example 2', input: '{"nums":[5,8,13],"space":4}' },
  ],
}

export default function DestroySequentialTargets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.r !== null && run.input.nums[i] % run.input.space === step.r ? 'group' : '')} />
    <FrequencyCountTable title="Targets per remainder" entries={step.counts} active={step.r} emptyText="No groups yet." />
    <output aria-label="Best seed">{step.phase === 'done' ? `Answer ${run.result}` : `space = ${run.input.space}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Two targets are destroyed by the same seed when they leave the same remainder modulo space. Each remainder is one group, and the seed that works for the largest group is the answer.</p>
    <p>Among tied groups, the smallest value in the group is the smallest seed, so each group only needs its minimum.</p>
  </>} />
}
