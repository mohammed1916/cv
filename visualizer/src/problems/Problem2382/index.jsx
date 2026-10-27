import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Everything is removed; the best sum is zero.' },
    { id: 'record', label: 'Record', description: 'Record the best sum for the current query.' },
    { id: 'add', label: 'Put back', description: 'Return the removed value to its position.' },
    { id: 'merge', label: 'Merge', description: 'Join it with present neighbours and update the best sum.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums and remove_queries as JSON, e.g. {"nums": [1,2,5,6,1], "remove_queries": [0,3,2,4,1]}',
  url: 'https://leetcode.com/problems/maximum-segment-sum-after-removals/',
  complexity: 'O(n α(n)) time with union-find. The visualization caps nums at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums": [1,2,5,6,1], "remove_queries": [0,3,2,4,1]}' },
  ],
}

export default function MaximumSegmentSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums (present positions are in a segment)" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
        active={step.index ?? -1} roleAt={i => (step.present.includes(i) ? 'present' : 'removed')} />
      <output aria-label="Answers so far">{`Best segment sum: ${step.best}. Answers: [${step.answers.join(', ')}]`}</output>
      <p>{step.message}</p>
    </>
  )} renderReasoning={() => (
    <>
      <p>Removing values one by one only breaks segments, so reading the queries backwards turns the problem into adding values, which only merges segments.</p>
      <p>Each answer is the largest segment sum before the value added for the next query is restored, so it can be read off as the running maximum.</p>
    </>
  )} />
}
