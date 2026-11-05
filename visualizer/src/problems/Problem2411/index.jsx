import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2411',
  phases: [
    { id: 'scan', label: 'Scan', description: 'Walk start positions from right to left, updating the nearest index of each bit.' },
    { id: 'done', label: 'Result', description: 'Return the shortest length for each start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 0, 2, 1, 3]}',
  url: 'https://leetcode.com/problems/smallest-subarrays-with-maximum-bitwise-or/',
  complexity: 'O(n * b) time and O(b) extra space for b bits. The visualization uses four bits.',
  examples: [
    { label: 'Example', input: '{"nums":[1,0,2,1,3]}' },
    { label: 'Two', input: '{"nums":[1,2]}' },
  ],
}

export default function SmallestMaxOrSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.i}
        roleAt={i => (i === step.i ? 'l' : step.r >= 0 && i === step.r ? 'r' : step.i >= 0 && i > step.i && i <= step.r ? 'window' : '')} />
      <table aria-label="Nearest index of each bit">
        <thead><tr>{step.nearest.map((_, b) => <th key={b} scope="col">{`bit ${b}`}</th>)}</tr></thead>
        <tbody><tr>{step.nearest.map((x, b) => <td key={b}>{x}</td>)}</tr></tbody>
      </table>
      <output aria-label="Answers so far">{`answers ${step.answer.join(', ')}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>The maximum OR of any subarray starting at i is the OR of everything from i to the end. The shortest subarray that reaches it must extend as far as the last position that supplies each bit.</p>
    <p>Keep, for each bit, the nearest index at or after i that has that bit set. The farthest of these indices gives the answer for i.</p>
  </>} />
}
