import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the letters of the string.' },
    { id: 'match', label: 'Match', description: 'This mirrored pair already agrees.' },
    { id: 'change', label: 'Change pair', description: 'Replace both letters with the smaller one.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest palindrome.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-palindrome/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example', input: '{"s":"egcfe"}' },
    { label: 'Alphabet', input: '{"s":"abcd"}' },
  ],
}

export default function SmallestPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Letters" length={step.chars.length} valueAt={i => step.chars[i]} active={step.index}
      roleAt={i => (i === step.mirror ? 'mirror' : '')} />
    <output aria-label="Current string">{`Current string: ${step.chars.join('')}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each mismatched pair needs exactly one change, and the smaller letter is the only choice that keeps the result lexicographically smallest.</p>
  </>} />
}
