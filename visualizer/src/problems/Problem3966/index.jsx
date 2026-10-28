import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Count up to r, then subtract the count up to l - 1.' },
    { id: 'bound', label: 'Bound', description: 'Walk the digits of a bound, remembering the previous digit and whether the walk is still tight.' },
    { id: 'done', label: 'Return', description: 'The difference is the count inside the range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"l": l, "r": r, "k": k}',
  url: 'https://leetcode.doocs.org/en/lc/3966/',
  complexity: 'O(d * 10 * 10 * 2) time per bound for d digits, with memoization. The visualization caps r at 5000.',
  examples: [
    { label: 'Example 1', input: '{"l":10,"r":15,"k":1}' },
    { label: 'Example 2', input: '{"l":201,"r":204,"k":2}' },
  ],
}

export default function CountGoodIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Digit walk">{`Bound: ${step.bound ?? '-'}, memo states: ${step.states}, count: ${step.count ?? '-'}`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Counting the good numbers up to a bound is a digit walk: the only thing the future depends on is the previous digit, the tight flag, and whether a digit has started.</p>
    <p>Subtracting the count up to l - 1 from the count up to r leaves the good numbers in the range.</p>
  </>} />
}
