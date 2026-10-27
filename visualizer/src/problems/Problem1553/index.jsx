import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with all n oranges remaining.' },
    { id: 'base', label: 'Base', description: 'Zero or one orange left takes that many days.' },
    { id: 'visit', label: 'Compare', description: 'Compare the half and two-thirds options.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the days already computed for this count.' },
    { id: 'store', label: 'Store', description: 'Save the fewest days for this count.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest days.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 2000)',
  url: 'https://leetcode.com/problems/minimum-number-of-days-to-eat-n-oranges/',
  complexity: 'O(log n) distinct states are reached, so the memoized recursion is fast. The visualization caps n at 2000.',
  examples: [
    { label: 'Example 1', input: '{"n":10}' },
    { label: 'Example 2', input: '{"n":6}' },
  ],
}

export default function EatNOranges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Remaining oranges">{`Remaining: ${step.remaining}`}</output>
    <table aria-label="Memo table">
      <thead><tr><th>Remaining</th><th>Fewest days</th></tr></thead>
      <tbody>{step.memo.map(e => <tr key={e.remaining}><td>{e.remaining}</td><td>{e.days}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>On each day you may eat one orange, half of the remaining oranges when that is even, or two thirds when the count divides by three.</p>
    <p>Eating one orange first makes a count even or divisible by three, which is why the recurrence adds the remainder before halving or dividing by three.</p>
  </>} />
}
