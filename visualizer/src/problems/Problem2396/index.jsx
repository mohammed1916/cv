import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bases', description: 'Bases run from 2 to n minus 2.' },
    { id: 'base', label: 'Base', description: 'Convert n into this base.' },
    { id: 'pass', label: 'Palindrome', description: 'The digits read the same both ways.' },
    { id: 'fail', label: 'Not palindrome', description: 'One base breaks the pattern.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (4 to 2000 in this visualization)',
  url: 'https://leetcode.com/problems/strictly-palindromic-number/',
  complexity: 'O(n^2 log n) time in the worst case, but the first failing base usually ends the check at once.',
  examples: [
    { label: 'Six', input: '{"n":6}' },
    { label: 'Twelve', input: '{"n":12}' },
    { label: 'Smallest n', input: '{"n":4}' },
    { label: 'Odd n', input: '{"n":5}' },
    { label: 'Largest allowed n', input: '{"n":2000}' },
    { label: 'Long run: n = 1999', input: '{"n":1999}' },
  ],
}

export default function StrictlyPalindromicNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Digits of ${run.input.n} in base ${step.base ?? '-'} (least significant first)`} length={step.digits.length}
      valueAt={i => step.digits[i]} active={step.mismatch >= 0 ? step.mismatch : -1}
      roleAt={i => (step.mismatch >= 0 && (i === step.mismatch || i === step.digits.length - 1 - step.mismatch) ? 'compare' : '')} />
    <output aria-label="Current base">{`base ${step.base ?? '-'}, ${step.result === null ? 'checking' : step.result ? 'strictly palindromic' : 'not strictly palindromic'}`}</output>
  </>} renderReasoning={() => <>
    <p>n written in base n minus 2 is “12”, so the test can never pass for every base. The loop still shows the first base that breaks the pattern.</p>
    <p>Each base is tested by converting n to digits and comparing the outer pairs, moving inward.</p>
  </>} />
}
