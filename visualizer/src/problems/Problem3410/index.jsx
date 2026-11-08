import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'keep', label: 'Keep all', description: 'Best subarray with nothing removed.' },
    { id: 'try', label: 'Try a value', description: 'Skip every copy of one value and rescan.' },
    { id: 'done', label: 'Result', description: 'The largest sum among all tries.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from -9 to 9)',
  url: 'https://leetcode.com/problems/maximize-subarray-sum-after-removing-all-occurrences-of-one-element/description/',
  complexity: 'O(n * d) time for n values with d distinct values. The visualization caps nums at 10 values.',
  examples: [
    { label: 'Invented list', input: JSON.stringify({ nums: [-3, 2, -2, -1, 3, -2, 3] }) },
    { label: 'Negative edge', input: JSON.stringify({ nums: [-4, -1, -2] }) },
    { label: 'Single element', input: '{"nums":[5]}' },
    { label: 'Equal values, one removal', input: '{"nums":[-2,-2,-2]}' },
    { label: 'Extreme values', input: '{"nums":[9,-9,9,-9,9,-9,9,-9,9,9]}' },
    { label: 'Long run: 10 items', input: '{"nums":[-3,-6,9,5,-1,3,-9,8,8,8]}' },
  ],
}

export default function MaximizeSubarraySumAfterRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.removed !== null && run.input.nums[i] === step.removed ? 'removed' : step.window && i === step.window.start ? 'l' : step.window && i === step.window.end ? 'r' : step.window && i > step.window.start && i < step.window.end ? 'window' : '')} />
    <output aria-label="Removal try">{`removed ${step.removed ?? 'nothing'}, window sum ${step.window ? step.window.sum : '-'}, best so far ${step.best.sum}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing a value joins the pieces on either side of it, so a subarray can span the gap. Skipping that value during the scan models exactly this.</p>
    <p>The scan keeps a running sum and restarts it whenever the running sum turns negative.</p>
  </>} />
}
