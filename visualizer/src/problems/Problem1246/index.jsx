import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RangeTableView from './RangeTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1246',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (e.g. [1,2,3,2,1])',
  url: 'https://leetcode.com/problems/palindrome-removal/description/',
  complexity: 'O(n^3) time and O(n^2) space for an n-element array. The visualization caps the array at 10 values; the draft does not state an exact official bound.',
  examples: [
    { label: 'Whole palindrome', input: '[1,2,3,2,1]' },
    { label: 'Pair it up', input: '[1,3,4,1,5]' },
    { label: 'Single value', input: '[7]' },
  ],
}

export default function Problem1246PalindromeRemoval() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RangeTableView run={run} step={step} />}
      renderReasoning={() => (
        <p>Each range is decided from smaller ranges. The first value either goes alone, or it joins an equal value later on after the stretch between them is cleared, which costs no extra move.</p>
      )}
    />
  )
}
