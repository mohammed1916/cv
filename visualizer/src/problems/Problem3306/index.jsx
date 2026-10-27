import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Plan to count at least k consonants and subtract at least k plus one.' },
    { id: 'extend', label: 'Extend', description: 'Grow the window until it has all five vowels and enough consonants.' },
    { id: 'count', label: 'Count', description: 'Every end from the window to the string end completes this start.' },
    { id: 'shrink', label: 'Shrink', description: 'Remove the left letter before the next start.' },
    { id: 'done', label: 'Complete', description: 'Subtract the two counts to get exactly k consonants.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word and k',
  url: 'https://leetcode.com/problems/count-of-substrings-containing-every-vowel-and-k-consonants-ii/',
  complexity: 'O(n) time for each of the two sliding windows. The visualization caps input at 16 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aeioqq","k":1}' },
    { label: 'Example 3', input: '{"word":"ieaouqqieaouqq","k":1}' },
  ],
}

export default function VowelConsonantSubstringsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.word.length} valueAt={i => run.input.word[i]} active={Math.min(step.right, run.input.word.length - 1)}
      roleAt={i => (i >= step.left && i < step.right ? 'window' : '')} />
    <output aria-label="Window">{`Need ${step.need} consonants. Window ${step.left} to ${step.right - 1}. Running total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Counting substrings with at least a threshold of consonants is a single sliding window, so exactly k is the difference of two such counts.</p>
  </>} />
}
