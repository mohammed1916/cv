import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Divisors', description: 'List the divisors of n; each factor comes from this list.' },
    { id: 'try', label: 'Candidate', description: 'A full split was built; compare its max-min gap.' },
    { id: 'done', label: 'Result', description: 'The split with the smallest gap is returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k',
  url: 'https://leetcode.com/problems/balanced-k-factor-decomposition/',
  complexity: 'Search over non-decreasing divisor lists, pruned by the product bound. The visualization caps n at 1000.',
  examples: [
    { label: 'Example', input: '{"n":60,"k":3}' },
    { label: 'Square', input: '{"n":36,"k":2}' },
  ],
}

export default function BalancedKFactorDecomposition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Factor split">{`n = ${run.input.n}, k = ${run.input.k}; candidate [${(step.parts ?? []).join(', ')}], best [${(step.best ?? []).join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Every factor divides n, so the search only tries divisors. Keeping factors in non-decreasing order avoids testing the same multiset twice.</p>
    <p>Once k - 1 factors are chosen, the last factor is forced to be what remains, so the spread is known immediately.</p>
  </>} />
}
