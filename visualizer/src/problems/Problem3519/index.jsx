import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count up to r, then remove the count below l.' },
    { id: 'digit', label: 'Digit', description: 'Walk the base-b digits of the bound and add the completions.' },
    { id: 'done', label: 'Complete', description: 'Report the difference modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with decimal strings l and r and a base b, for example {"l": "23", "r": "28", "b": 8}',
  url: 'https://leetcode.doocs.org/en/lc/3519/',
  complexity: 'O(d * b) digit steps with binomial lookups, for d base-b digits. The visualization caps input at 30 decimal digits.',
  examples: [
    { label: 'Example 1', input: '{"l":"23","r":"28","b":8}' },
    { label: 'Example 2', input: '{"l":"2","r":"7","b":2}' },
  ],
}

export default function NonDecreasingDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Current bound">{`Counting ${step.part === 'l-1' ? 'below l' : 'up to r'}, digit ${step.digit ?? '-'} at position ${step.position}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total} (base ${run.input.b})`}</output>
  </>} renderReasoning={() => <>
    <p>Count the qualifying numbers up to r, subtract the count up to l minus one, and reduce modulo 1000000007.</p>
    <p>Shorter numbers are multiset counts; for the bound itself, each smaller digit that keeps the order opens a block of completions counted in one binomial.</p>
  </>} />
}
