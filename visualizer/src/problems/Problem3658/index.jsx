import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both running sums start at zero.' },
    { id: 'sum', label: 'Add pair', description: 'Add the next odd and even numbers to their sums.' },
    { id: 'done', label: 'Complete', description: 'Take the gcd of the two sums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/gcd-of-odd-and-even-sums/',
  complexity: 'O(n) time with the sums built directly. The closed form n^2 and n(n+1) gives the same answer in O(1).',
  examples: [
    { label: 'n = 4', input: '{"n":4}' },
    { label: 'n = 1', input: '{"n":1}' },
  ],
}

export default function GcdOfOddAndEvenSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <table aria-label="Running sums">
    <thead><tr><th>i</th><th>Odd sum</th><th>Even sum</th></tr></thead>
    <tbody><tr><td>{step.i}</td><td>{step.oddSum}</td><td>{step.evenSum}</td></tr></tbody>
  </table>} renderReasoning={() => <>
    <p>The first n odd numbers add up to n squared, and the first n even numbers add up to n times n plus one.</p>
    <p>Both sums share the factor n, and the remaining factors n and n plus one are coprime, so the gcd is exactly n.</p>
  </>} />
}
