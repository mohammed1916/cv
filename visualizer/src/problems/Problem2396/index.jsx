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
    { label: 'Example', input: '{"n":9}' },
    { label: 'Small', input: '{"n":4}' },
  ],
}

export default function StrictlyPalindromicNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Digits of ${run.input.n}`} length={step.digits.length} valueAt={i => step.digits[step.digits.length - 1 - i]}
      active={-1} roleAt={i => (step.result === false && step.digits[i] !== step.digits[step.digits.length - 1 - i] ? 'mismatch' : '')} />
    <output aria-label="Current base">{`base ${step.base ?? '-'}, ${step.result === null ? 'checking' : step.result ? 'strictly palindromic' : 'not strictly palindromic'}`}</output>
  </>} renderReasoning={() => <>
    <p>n written in base n minus 2 is “12”, so the test can never pass for every base. The loop still shows the first base that breaks the pattern.</p>
    <p>Each base is tested by converting n to digits and comparing the list with its reverse.</p>
  </>} />
}
