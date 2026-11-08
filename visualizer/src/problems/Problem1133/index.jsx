import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a list nums (JSON)',
  url: 'https://leetcode.com/problems/largest-unique-number/',
  complexity: 'O(n) time to count and O(k log k) to order the k distinct values, with O(k) extra space. The visualization caps the list at 20 entries.',
  examples: [
    { label: 'Mixed repeats', input: '{"nums":[5,7,7,3,5,9]}' },
    { label: 'No unique value', input: '{"nums":[4,4,2,2]}' },
    { label: 'Single zero', input: '{"nums":[0]}' },
    { label: 'Single largest value', input: '{"nums":[1000]}' },
    { label: 'All distinct', input: '{"nums":[1,2,3,4]}' },
    { label: 'Long run: 20 values', input: '{"nums":[0,16,20,0,20,2,6,18,1,4,11,1,13,11,12,13,15,15,4,13]}' },
  ],
}

export default function LargestUniqueNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const rows = Object.entries(s.counts).map(([value, count]) => ({ value: Number(value), count })).sort((a, b) => b.value - a.value)
    const activeRow = rows.findIndex(row => row.value === s.current)
    return <>
      <RecordStateTable label="Count of each value (largest value first)" columns={['value', 'count']} rows={rows} activeRow={activeRow} />
      <output aria-label="Answer">{s.answer !== null && s.answer !== undefined ? `Largest unique so far: ${s.answer}` : step.message}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <p>Count each value, then scan from the largest value down. The first value whose count is exactly one is the answer; if none exists the answer is -1.</p>} />
}
