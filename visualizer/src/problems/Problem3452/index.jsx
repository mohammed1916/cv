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
    { label: 'Six values, k two', input: '{"nums":[14,6,25,3,9,11],"k":2}' },
    { label: 'Smallest', input: '{"nums":[5,1],"k":1}' },
    { label: 'Smallest pair', input: '{"nums":[1,2],"k":1}' },
    { label: 'Equal values tie', input: '{"nums":[4,4,4,4],"k":2}' },
    { label: 'Largest list, extremes', input: '{"nums":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1],"k":15}' },
    { label: 'Long run: 30 values', input: '{"nums":[170,671,49,207,693,434,633,619,998,446,351,723,377,245,29,104,462,25,391,619,259,516,920,21,142,117,714,968,31,154],"k":10}' },
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
