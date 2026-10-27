import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read n.' },
    { id: 'special', label: 'Eleven special case', description: 'Even-length palindromes are multiples of 11.' },
    { id: 'skip', label: 'Skip small halves', description: 'Palindromes below n are not tested.' },
    { id: 'candidate', label: 'Build palindrome', description: 'Mirror a left half into an odd-length palindrome.' },
    { id: 'test', label: 'Primality test', description: 'Trial division up to the square root.' },
    { id: 'done', label: 'Complete', description: 'The first prime palindrome at least n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n (JSON, 1 to 100,000,000)',
  url: 'https://leetcode.com/problems/prime-palindrome/',
  complexity: 'About 10^4 odd-length palindromes to scan, each tested in O(sqrt p) time.',
  examples: [
    { label: 'n = 6', input: '6' },
    { label: 'n = 8', input: '8' },
    { label: 'n = 13', input: '13' },
    { label: 'n = 9989900', input: '9989900' },
    { label: 'n = 100000000', input: '100000000' },
  ],
}

export default function PrimePalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const digits = step.p === null || step.p === undefined ? '' : String(step.p)
    const halfLen = step.half === null || step.half === undefined ? 0 : String(step.half).length
    return <>
      <output aria-label="Target">n = {run.input}</output>
      {digits && <IndexedSequence label={`Palindrome ${digits} (left half ${step.half ?? 'n/a'})`} length={digits.length} valueAt={i => digits[i]} active={-1}
        roleAt={i => (step.half === null ? '' : i < halfLen ? 'written' : 'shifted')} />}
      {step.phase === 'skip' && <output aria-label="Skipped">{step.skipped} palindromes below n skipped</output>}
      {(step.phase === 'test' || step.phase === 'done') && step.prime !== null && <output aria-label="Primality">{step.p} is {step.prime ? 'prime' : `not prime (divisible by ${step.divisor})`}</output>}
      {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Palindromes from halves:</strong> a palindrome of odd length is a half followed by that half reversed without its last digit, so increasing halves give increasing palindromes.</p>
    <p><strong>Even lengths:</strong> a palindrome with an even number of digits is divisible by 11, so none is prime except 11 itself, handled separately.</p>
    <p><strong>Bound:</strong> the answer is below 10^8 + 10^5, so halves under 100000 are enough.</p>
  </>} />
}
