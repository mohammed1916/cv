import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the values from largest to smallest.' },
    { id: 'step', label: 'Pair', description: 'The next largest value takes the next largest factor, or 1 once the multiplier runs out.' },
    { id: 'done', label: 'Return', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "k": k, "mul": mul}',
  url: 'https://leetcode.doocs.org/en/lc/3974/',
  complexity: 'O(n log n) time for sorting, and O(1) extra space beyond the sorted copy. The visualization caps nums at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[6,1,2,9],"k":3,"mul":2}' },
    { label: 'Example 2', input: '{"nums":[3,7,5,2],"k":2,"mul":4}' },
  ],
}

export default function MaximumTotalSumKSelected() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input values" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={-1} />
    <output aria-label="Current step">{`Multiplier for this step: ${step.factor ?? '-'}. Total: ${step.total}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Every chosen element is either added or multiplied by the current multiplier, so a larger value should meet a larger factor.</p>
    <p>The factors fall by one per step and are never below 1 when used, so the best plan takes the k largest values in sorted order.</p>
  </>} />
}
