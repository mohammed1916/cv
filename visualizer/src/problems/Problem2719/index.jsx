import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Precompute how many digit strings reach each digit sum.' },
    { id: 'count', label: 'Count', description: 'Count integers up to a bound by fixing one smaller digit at a time.' },
    { id: 'done', label: 'Combine', description: 'Subtract the lower count and add the lower bound back if it fits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num1, num2, min_sum and max_sum',
  url: 'https://leetcode.com/problems/count-of-integers/',
  complexity: 'O(d * 9 * S) time for d digits and digit sums up to S. The visualization caps num2 at 4 digits.',
  examples: [
    { label: 'Example 1', input: '{"num1":"1","num2":"12","min_sum":1,"max_sum":8}' },
    { label: 'Example 2', input: '{"num1":"1","num2":"5","min_sum":2,"max_sum":3}' },
  ],
}

export default function CountOfIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`Range: ${run.input.num1} to ${run.input.num2}, digit sum ${run.input.min_sum} to ${run.input.max_sum}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total}${step.bound ? ` (bound ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Counting integers up to a bound is a digit walk: at each position, a smaller digit leaves every completion free, and those completions are read from the digit-sum table.</p>
    <p>The count for the range is the count up to num2 minus the count up to num1, plus num1 itself when its digit sum fits.</p>
  </>} />
}
