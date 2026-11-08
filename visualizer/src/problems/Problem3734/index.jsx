import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the letters and check the odd counts.' },
    { id: 'check', label: 'Try target half', description: 'Test the palindrome built from the target half.' },
    { id: 'found', label: 'Found', description: 'The smallest palindrome above target.' },
    { id: 'done', label: 'Complete', description: 'No palindromic permutation is above target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and target, for example {"s":"baba","target":"abba"}',
  url: 'https://leetcode.com/problems/lexicographically-smallest-palindromic-permutation-greater-than-target/',
  complexity: 'O(n * 26) time for strings of length n. The visualization caps the strings at 8 letters.',
  examples: [
    { label: 'Adjacent pairs swapped', input: '{"s":"pqrs","target":"qpsr"}' },
    { label: 'Repeated letters to target', input: '{"s":"aaa","target":"zzz"}' },
    { label: 'Single letter', input: '{"s":"a","target":"a"}' },
    { label: 'Two letters swapped', input: '{"s":"ab","target":"ba"}' },
    { label: 'Longest allowed', input: '{"s":"abcdefgh","target":"hgfedcba"}' },
    { label: 'Long run: 8 letters', input: '{"s":"bcbaccab","target":"accccaac"}' },
  ],
}

export default function SmallestPalindromeAboveTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Target letters" length={run.input.target.length} valueAt={i => run.input.target[i]}
      active={(step.half || '').length} roleAt={i => i < (step.half || '').length ? 'chosen half' : ''} />
    <output aria-label="Half">{`Half letters: ${step.half || '(none)'}`}</output>
    <output aria-label="Candidate">{`Candidate palindrome: ${step.candidate || '(none)'}. Target: ${run.input.target}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is fixed by its first half, so only the first half needs to be chosen and the rest is a mirror image.</p>
    <p>If the target's first half is itself usable, that palindrome may or may not beat the target. Otherwise the smallest larger half gives the answer.</p>
  </>} />
}
