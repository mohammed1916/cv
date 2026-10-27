import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'total', label: 'Total', description: 'Split the target into whole copies and a leftover sum.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value of the two-copy array to the window.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the window start forward while the sum is above the leftover.' },
    { id: 'record', label: 'Record', description: 'Keep the shortest window with exactly the leftover sum.' },
    { id: 'done', label: 'Complete', description: 'Add the whole copies back to the shortest window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 30 values from 1 to 100) and target, for example {"nums":[1,2,3],"target":5}',
  url: 'https://leetcode.com/problems/minimum-size-subarray-in-infinite-array/',
  complexity: 'O(n) time on the two-copy array. The visualization caps nums at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"target":5}' },
    { label: 'Whole copies', input: '{"nums":[3,1],"target":8}' },
  ],
}

export default function MinimumSizeInfiniteArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Two copies of nums" length={run.input.nums.length * 2} valueAt={index => run.input.nums[index % run.input.nums.length]}
      active={step.right} roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Window sum">{`Window sum ${step.window} against leftover ${step.rem} (whole copies ${step.full}). Best length: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every whole copy of nums adds the same total, so the target can be split into full copies and a leftover sum below one copy.</p>
    <p>The leftover is found as the shortest window in two copies, because a window with that sum never needs more than one wrap.</p>
  </>} />
}
