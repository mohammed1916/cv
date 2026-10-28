import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every word starts as a chain of length 1.' },
    { id: 'link', label: 'Extend', description: 'Extend an earlier chain when groups alternate and the words differ by one letter.' },
    { id: 'end', label: 'Best end', description: 'Find the word that ends the longest chain.' },
    { id: 'done', label: 'Complete', description: 'Walk back through the predecessors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with words (short lowercase strings) and groups (0 or 1 for each word)',
  url: 'https://leetcode.com/problems/longest-unequal-adjacent-groups-subsequence-ii/',
  complexity: 'O(n^2 * L) time for n words of length L, and O(n) space. The visualization caps input at 10 words.',
  examples: [
    { label: 'Single letters', input: '{"words":["a","b","c","d"],"groups":[1,0,1,0]}' },
    { label: 'One-letter steps', input: '{"words":["ab","ac","bc"],"groups":[0,1,0]}' },
  ],
}

export default function UnequalGroupsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={i => `${run.input.words[i]} (g${run.input.groups[i]})`}
      active={step.index ?? -1} roleAt={i => `len ${step.dp[i]}`} />
    <p aria-label="Chain lengths">{`Longest chain ending here: ${step.dp.join(', ')}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each word keeps the length of the longest valid chain that ends with it. A predecessor must have the other group and differ from it in exactly one letter.</p>
  </>} />
}
