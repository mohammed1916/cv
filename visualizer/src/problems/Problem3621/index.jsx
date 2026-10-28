import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'zero', label: 'k = 0', description: 'Only the number 1 has depth 0.' },
    { id: 'class', label: 'Popcount class', description: 'Count the numbers up to n with this many set bits, when their depth is k minus 1.' },
    { id: 'adjust', label: 'Remove 1', description: 'The number 1 is in the popcount-1 class but has depth 0.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and k',
  url: 'https://leetcode.com/problems/number-of-integers-with-popcount-depth-equal-to-k-i/',
  complexity: 'O(log^2 n) time with binomial coefficients, independent of the size of n.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"k":1}' },
    { label: 'Example 2', input: '{"n":7,"k":2}' },
  ],
}

export default function PopcountDepthCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Class">{step.c === null ? `n = ${run.input.n}, k = ${run.input.k}` : `Popcount ${step.c}: ${step.count} numbers, depth of this class ${step.depth + 1}`}</output>
    <output aria-label="Total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>The depth of x is one more than the depth of its popcount, so a number has depth k exactly when its popcount has depth k minus 1.</p>
    <p>Each popcount class up to n is counted from the bits of n with binomial coefficients, so n up to 10^15 needs no enumeration.</p>
  </>} />
}
