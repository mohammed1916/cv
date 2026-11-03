import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PolynomialView from './PolynomialView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Result', description: 'Allocate one slot per product degree.' },
    { id: 'pair', label: 'Pair', description: 'Multiply one term of a by one term of b.' },
    { id: 'done', label: 'Done', description: 'Every pair has been combined.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a and b (coefficient lists, lowest degree first)',
  url: 'https://leetcode.com/problems/multiply-two-polynomials/',
  complexity: 'O(n * m) time for coefficient lists of length n and m, and O(n + m) space for the product. The visualization caps each list at 8 coefficients.',
  examples: [
    { label: 'Pair of binomials', input: '{"a":[3,-1],"b":[2,0,4]}' },
    { label: 'Constant times a line', input: '{"a":[5],"b":[0,-2,1]}' },
  ],
}

export default function MultiplyTwoPolynomials() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <PolynomialView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Because the list index is the degree, the product of x to the i and x to the j lands at index i plus j.</p>
    </>} />
}
