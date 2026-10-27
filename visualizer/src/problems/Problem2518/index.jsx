import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Compare the total with 2k.' },
    { id: 'item', label: 'Add number', description: 'Each number updates how many subsets reach each sum.' },
    { id: 'done', label: 'Complete', description: 'Count the sums that leave both groups at least k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: nums (1-5 each) and k',
  url: 'https://leetcode.com/problems/number-of-great-partitions/',
  complexity: 'O(n * total) time and O(total) space. The visualization caps input at 10 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4],"k":4}' },
    { label: 'Too small', input: '{"nums":[3,3,3],"k":4}' },
  ],
}

export default function GreatPartitions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Subsets by sum" length={run.input.nums.reduce((a, b) => a + b, 0) + 1} valueAt={i => (step.ways[i] ?? 0)}
      active={step.answer === null && step.ways.length ? -1 : -1} roleAt={i => (i >= run.input.k && i <= step.total - run.input.k ? 'counted' : '')} />
    <output aria-label="Answer">{step.answer === null ? `Items added: ${step.item === null ? 0 : step.item + 1}` : `Answer: ${step.answer}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Choosing a subset A fixes its complement B, so the ordered partitions correspond to subsets whose sum s satisfies k &lt;= s and total - s &gt;= k.</p>
  </>} />
}
