import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MinOperationsPalindromicView from './MinOperationsPalindromicView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4053',
  phases: [
    { id: 'setup', label: 'Palindromes', description: 'Prepare the sorted list of positive palindromes.' },
    { id: 'search', label: 'Neighbours', description: 'Find the nearest palindromes of the same parity.' },
    { id: 'add', label: 'Cost', description: 'Take the cheaper side and add its cost.' },
    { id: 'done', label: 'Result', description: 'Report the total number of operations.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of positive integers, e.g. [10, 21, 34]',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-every-element-palindromic/',
  complexity: 'O(P + n log P) time after building the sorted palindrome list P once, where P is about 2 * 10^5 values up to 10 digits. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Mixed parities', input: '[10, 21, 34]' },
    { label: 'Already palindromes', input: '[1, 22, 303]' },
    { label: "Single value", input: "[1]" },
    { label: "Equal values", input: "[5,5,5]" },
    { label: "Largest values", input: "[1000000000,999999999]" },
    { label: "Long run: twelve values", input: "[91103075,636516379,282109352,700505987,124460083,812645212,197015351,127997322,558688571,455966049,937110489,260379461]" },
  ],
}

export default function MinOperationsPalindromicVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinOperationsPalindromicView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `The sum of the chosen costs is ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
