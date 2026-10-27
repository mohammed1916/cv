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
    { label: 'Example 1', input: '{"word1":"cacb","word2":"cbba"}' },
    { label: 'Example 2', input: '{"word1":"ab","word2":"ab"}' },
    { label: 'No pair', input: '{"word1":"aa","word2":"bb"}' },
  ],
}

export default function MaximizePalindromeLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input.word1 + run.input.word2
    const [i, j] = step.cell ?? [-1, -1]
    return <>
      <IndexedSequence label="word1 followed by word2" length={s.length} valueAt={k => s[k]} active={i}
        roleAt={k => (k === i || k === j ? 'pair' : k < run.input.word1.length ? 'word1' : 'word2')} />
      <output aria-label="Best so far">{`Best so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A palindrome built from a subsequence of each word has matching outer letters, one from word1 and one from word2, around a palindrome of the letters between them.</p>
    <p>The table gives the inner palindrome length for every span, so each cross pair is scored in constant time.</p>
  </>} />
}
