import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the number after n.' },
    { id: 'reject', label: 'Reject', description: 'A palindrome whose digit counts are wrong is skipped.' },
    { id: 'found', label: 'Found', description: 'A palindrome where every digit d appears d times is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with integer n (JSON)',
  url: 'https://leetcode.com/problems/next-special-palindrome-number/',
  complexity: 'Scans candidates one at a time after n. The visualization caps n at 5000.',
  examples: [
    { label: 'Example 1', input: '{"n":2}' },
    { label: 'Example 2', input: '{"n":33}' },
  ],
}

export default function NextSpecialPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Candidate">{`Candidate ${step.candidate}`}</output>
    <output aria-label="Palindromes checked">{`Palindromes checked: ${step.checked.join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A special palindrome must read the same both ways, and each digit d in it must appear exactly d times, so digit 0 can never appear.</p>
  </>} />
}
