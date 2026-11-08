import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '961',
  title: 'N-Repeated Element in Size 2N Array',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: an even-length list where one value fills exactly half the slots',
  url: 'https://leetcode.com/problems/n-repeated-element-in-size-2n-array/',
  complexity: 'O(n) time for the scan and O(n) space for the tally.',
  examples: [
    { label: 'Repeat at the end', input: JSON.stringify({ nums: [7, 3, 9, 7, 2, 7, 1, 7] }) },
    { label: 'Adjacent repeats', input: JSON.stringify({ nums: [4, 4, 1, 6, 4, 5] }) },
    { label: 'Spread out', input: JSON.stringify({ nums: [8, 2, 5, 8, 6, 8, 3, 8] }) },
    { label: 'Smallest list', input: '{"nums":[1,2,1,3]}' },
    { label: 'Repeated value at the front', input: '{"nums":[5,5,5,1,2,3]}' },
    { label: 'Largest values', input: '{"nums":[10000,10000,0,7]}' },
    { label: 'Long run: 20 values', input: '{"nums":[8426,2701,8426,7667,8426,5684,8426,4882,8426,7825,8426,5277,8426,5250,8426,8239,8426,6044,8426,4272]}' },
  ],
}

export default function Problem961() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input array" length={run.input.nums.length} active={step.index}
      valueAt={index => run.input.nums[index]}
      roleAt={index => (index < step.index ? 'read' : index === step.index ? 'current' : '')} />
    <RecordStateTable label="Tally so far" columns={['value', 'count']}
      rows={step.tally.map(([value, count]) => ({ value, count }))}
      activeRow={step.tally.findIndex(([value]) => value === step.value)} />
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>The half-length target is {step.half}. Any value that reaches it is the answer.</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
