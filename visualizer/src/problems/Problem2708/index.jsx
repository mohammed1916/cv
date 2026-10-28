import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Values', description: 'Look at every value in the array.' },
    { id: 'positive', label: 'Positives', description: 'Every positive value joins the group.' },
    { id: 'pair', label: 'Pairs', description: 'Pair the negatives, largest magnitude first.' },
    { id: 'done', label: 'Complete', description: 'Report the product or the fallback value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with an integer array nums (values -9 to 9)',
  url: 'https://leetcode.com/problems/maximum-strength-of-a-group/',
  complexity: 'O(n log n) time for the sort. The visualization caps the array at twelve values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,-1,-5,2,5,-9]}' },
    { label: 'Example 2', input: '{"nums":[-4,-5,-4]}' },
  ],
}

export default function MaximumStrengthGroup() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (step.marked.includes(index) ? 'chosen' : '')} />
    <output aria-label="Group">{`Group so far: ${step.marked.map(i => run.input.nums[i]).join(', ') || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A product of positives only grows, and an even number of negatives gives a positive product.</p>
    <p>Pair the negatives by largest magnitude first. If nothing positive can be formed, the best single value is the answer.</p>
  </>} />
}
