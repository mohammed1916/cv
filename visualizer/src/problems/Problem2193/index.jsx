import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PalindromeSwapView from './PalindromeSwapView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2193',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase letters, e.g. aabb',
  url: 'https://leetcode.com/problems/minimum-number-of-moves-to-make-palindrome/',
  complexity: 'O(n^2) time in the worst case for the match search and the swaps, and O(n) space. The page caps the string at 12 letters.',
  examples: [
    { label: 'Two pairs', input: 'aabb' },
    { label: 'One odd letter', input: 'zyxzy' },
    { label: 'Already a palindrome', input: 'racecar' },
    { label: 'Single letter', input: 'a' },
    { label: 'Equal letters', input: 'aaaaaa' },
    { label: 'Longest allowed: 12 letters', input: 'mmxyzyxmmabc' },
  ],
}

export default function Problem2193Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PalindromeSwapView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
