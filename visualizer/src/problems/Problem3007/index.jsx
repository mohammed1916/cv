import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Start the search with low 0 and high 1.' },
    { id: 'grow', label: 'Grow high', description: 'Double the upper bound while its price fits the budget.' },
    { id: 'keep', label: 'Affordable', description: 'The middle number fits the budget, so move low up.' },
    { id: 'drop', label: 'Too expensive', description: 'The middle number exceeds the budget, so move high down.' },
    { id: 'done', label: 'Complete', description: 'Report the largest affordable number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k (1 to 200) and x (1 to 8), e.g. {"k":9,"x":1}',
  url: 'https://leetcode.com/problems/maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k/',
  complexity: 'O(x log^2 N) time for the binary search with a per-bit closed formula. The visualization caps k at 200.',
  examples: [
    { label: 'Example 1', input: '{"k":9,"x":1}' },
    { label: 'Example 2', input: '{"k":7,"x":2}' },
  ],
}

export default function MaximumNumberPrice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Binary search bounds">
      <tbody>
        <tr><th scope="row">low</th><td>{step.low}</td></tr>
        <tr><th scope="row">high</th><td>{step.high}</td></tr>
        <tr><th scope="row">mid</th><td>{step.mid ?? '-'}</td></tr>
        <tr><th scope="row">Price of mid</th><td>{step.price ?? '-'}</td></tr>
        <tr><th scope="row">Budget k</th><td>{run.input.k}</td></tr>
      </tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>The total price of 1 through n never decreases as n grows, so the set of affordable numbers is a prefix.</p>
    <p>Each bit position contributes a closed-form count of numbers with that bit set, so every price check is fast.</p>
  </>} />
}
