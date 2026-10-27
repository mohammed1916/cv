import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'table', label: 'Table', description: 'Mark every palindromic substring.' },
    { id: 'end', label: 'Prefix', description: 'Start the best count for this prefix from the shorter prefix.' },
    { id: 'check', label: 'Check', description: 'Try a palindrome of length at least k ending here and add one to the best count before its start.' },
    { id: 'done', label: 'Complete', description: 'Report the best count for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a lowercase string s (up to 30 letters) and k, for example {"s":"abaccbdb","k":3}',
  url: 'https://leetcode.com/problems/maximum-number-of-non-overlapping-palindrome-substrings/',
  complexity: 'O(n^2) time for the palindrome table and the prefix scan. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Example', input: '{"s":"abaccbdb","k":3}' },
    { label: 'Single letters', input: '{"s":"ten","k":1}' },
  ],
}

export default function MaximumNonOverlappingPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.start ?? step.end - 1}
      roleAt={index => (step.start !== null && step.start <= index && index < step.end ? 'candidate' : '')} />
    <output aria-label="Best counts">{`Best counts for prefixes 0 to ${step.end}: [${step.best.slice(0, step.end + 1).join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>The best count for each prefix either matches the prefix before it or ends with a new palindrome of length at least k that starts after an earlier best prefix.</p>
    <p>The palindrome table lets each candidate be tested in constant time, so the full scan stays quadratic.</p>
  </>} />
}
