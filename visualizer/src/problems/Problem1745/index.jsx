import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'table', label: 'Table', description: 'Mark every palindromic substring using the ends and the inside.' },
    { id: 'cut', label: 'Cuts', description: 'Try a first cut and a second cut and check the three pieces.' },
    { id: 'done', label: 'Complete', description: 'Report whether a split into three palindromes was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a lowercase string s of 3 to 30 letters, for example {"s":"abcbdd"}',
  url: 'https://leetcode.com/problems/palindrome-partitioning-iv/',
  complexity: 'O(n^2) time for the table and the cut pairs. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcbdd"}' },
    { label: 'No split', input: '{"s":"leetcode"}' },
  ],
}

export default function PalindromePartitioningIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.b ?? -1}
      roleAt={index => {
        if (step.a === null) return ''
        if (index < step.a) return 'first'
        if (index < step.b) return 'second'
        return 'third'
      }} />
    <output aria-label="Cuts">{step.a === null ? 'No cuts tried yet' : `Cuts at ${step.a} and ${step.b}: ${step.found ? 'three palindromes' : 'not three palindromes'}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome table answers, in constant time, whether any substring reads the same both ways.</p>
    <p>Two cuts split the string into three pieces. The answer is yes when some pair of cuts gives three palindromes.</p>
  </>} />
}
