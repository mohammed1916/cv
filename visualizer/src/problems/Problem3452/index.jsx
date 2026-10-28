import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of zero.' },
    { id: 'check', label: 'Check index', description: 'Compare this value with the partners k steps away.' },
    { id: 'add', label: 'Add', description: 'The index is good, so its value joins the total.' },
    { id: 'done', label: 'Complete', description: 'Report the sum of good numbers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/sum-of-good-numbers/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,2,1,5,4],"k":2}' },
    { label: 'Smallest', input: '{"nums":[5,1],"k":1}' },
  ],
}

export default function SumOfGoodNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
        roleAt={i => (i === step.index ? (step.good ? 'kept' : 'rejected') : '')} />
      <output aria-label="Total">{`Total so far: ${step.total}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>An index is good when its value is strictly greater than the value k steps to the left and the value k steps to the right, whichever of those exist.</p>
    <p>A missing partner never disqualifies an index, so only the existing sides are compared.</p>
  </>} />
}
