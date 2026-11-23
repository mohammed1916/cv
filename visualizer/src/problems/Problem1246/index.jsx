import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RangeTableView from './RangeTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1246',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (e.g. [1,2,3,2,1])',
  url: 'https://leetcode.com/problems/palindrome-removal/description/',
  complexity: 'O(n^3) time and O(n^2) space for an n-element array. The visualization caps the array at 10 values; the draft does not state an exact official bound.',
  question: "Find the fewest moves to delete an array, where each move removes a contiguous palindromic subarray.",
  approaches: [
    { name: "Interval DP", intuition: "For each subarray, either remove the first element alone or pair it with an equal later value.", time: "O(n^3)", space: "O(n^2)" },
  ],
  examples: [
    { label: 'Whole palindrome', input: '[1,2,3,2,1]' },
    { label: 'Pair it up', input: '[1,3,4,1,5]' },
    { label: 'Single value', input: '[7]' },
    { label: 'One value, no pairs', input: '[5]' },
    { label: 'Equal values', input: '[3,3,3]' },
    { label: 'Alternating extremes', input: '[10,-10,10,-10,10,-10,10,-10,10,-10]' },
    { label: 'Long run: ten values', input: '[5,-4,10,6,6,-5,-2,-7,-3,-7]' },
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
