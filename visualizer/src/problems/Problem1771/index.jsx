import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Join words', description: 'Join word1 and word2 into one string.' },
    { id: 'fill', label: 'Fill table', description: 'Compute the longest palindromic subsequence of every span.' },
    { id: 'pair', label: 'Cross pair', description: 'Check a pair with one index in each word.' },
    { id: 'done', label: 'Complete', description: 'Report the longest cross palindrome.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two words as JSON: word1, word2',
  url: 'https://leetcode.com/problems/maximize-palindrome-length-from-subsequences/',
  complexity: 'O(L^2) time and space for L = |word1| + |word2|. The visualization caps each word at 6 letters.',
  examples: [
    { label: 'Different lengths', input: '{"word1":"tiger","word2":"owl"}' },
    { label: 'Identical words', input: '{"word1":"ray","word2":"ray"}' },
    { label: 'No pair', input: '{"word1":"aa","word2":"bb"}' },
  { label: 'Single letters', input: "{\"word1\":\"a\",\"word2\":\"a\"}" },
  { label: 'Single letter mismatch', input: "{\"word1\":\"a\",\"word2\":\"b\"}" },
  { label: 'Equal words', input: "{\"word1\":\"abab\",\"word2\":\"abab\"}" },
  { label: 'Longest words', input: "{\"word1\":\"zzzzzz\",\"word2\":\"zyzyzy\"}" },
  ],
}

export default function MaximizePalindromeLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input.word1 + run.input.word2
    const [i, j] = step.cell ?? [-1, -1]
    return <>
      <IndexedSequence label="word1 followed by word2" length={s.length} valueAt={k => s[k]} active={i}
        roleAt={k => (k === i ? 'l' : k === j ? 'r' : k < run.input.word1.length ? 'word1' : 'word2')} />
      <output aria-label="Best so far">{`Best so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A palindrome built from a subsequence of each word has matching outer letters, one from word1 and one from word2, around a palindrome of the letters between them.</p>
    <p>The table gives the inner palindrome length for every span, so each cross pair is scored in constant time.</p>
  </>} />
}
