import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No letter has a chain yet.' },
    { id: 'letter', label: 'Add letter', description: 'Read the window of letters within k and extend the best chain.' },
    { id: 'done', label: 'Complete', description: 'Report the longest chain over all letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k (JSON)',
  url: 'https://leetcode.com/problems/longest-ideal-subsequence/',
  complexity: 'O(n * 26) time and O(26) space for a string of length n. The visualization caps s at 10 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"acfgbd","k":2}' },
    { label: 'Example 2', input: '{"s":"abcd","k":3}' },
  ],
}

export default function LongestIdealSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Best chain ending in each letter" length={26} valueAt={i => step.best[i]}
      active={step.letter} indexOffset={0}
      roleAt={i => (step.window && i >= step.window[0] && i <= step.window[1] ? 'window' : '')} />
    <output aria-label="Letters">{step.position < 0 ? `Letters of ${run.input.s}` : step.position >= run.input.s.length ? `Answer: ${run.result}` : `Letter ${step.position + 1} of ${run.input.s.length}: ${run.input.s[step.position]}`}</output>
  </>} renderReasoning={() => <>
    <p>Two adjacent letters in an ideal subsequence are at most k apart in the alphabet.</p>
    <p>The best chain ending in a letter only depends on the best chains ending in letters within k of it, so each step reads one window.</p>
  </>} />
}
