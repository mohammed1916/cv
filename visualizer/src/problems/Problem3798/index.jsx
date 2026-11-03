import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3798,
  phases: [
    { id: 'scan', label: 'Scan', description: 'Walk from the right looking for a 2.' },
    { id: 'found', label: 'Keep', description: 'The first 2 seen from the right ends the answer.' },
    { id: 'done', label: 'Result', description: 'Report the kept prefix, or the empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (characters 1 and 2)',
  url: 'https://leetcode.com/problems/largest-even-number/',
  complexity: 'O(n) time and O(1) extra space: one scan from the right.',
  examples: [
    { label: 'Mixed digits', input: '{"s":"12121"}' },
    { label: 'No 2', input: '{"s":"111"}' },
  ],
}

export default function LargestEvenNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.keep >= 0 && i <= step.keep ? 'kept' : i > step.keep && step.keep >= 0 ? 'dropped' : '')} />
    <output aria-label="Result so far">{run.result || 'empty string (no even number)'}</output>
  </>} renderReasoning={() => <>
    <p>An integer is even exactly when its last digit is even. Here the only even digit available is 2.</p>
    <p>Keeping the longest possible prefix that ends at the last 2 gives the greatest length, and no other valid subsequence can be longer with the same ending.</p>
  </>} />
}
