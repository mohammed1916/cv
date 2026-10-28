import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty chain.' },
    { id: 'take', label: 'Take', description: 'The group changes, so this word joins the chain.' },
    { id: 'skip', label: 'Skip', description: 'The group repeats the last taken group, so skip the word.' },
    { id: 'done', label: 'Complete', description: 'Report the chain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with words (short lowercase strings) and groups (0 or 1 for each word)',
  url: 'https://leetcode.com/problems/longest-unequal-adjacent-groups-subsequence-i/',
  complexity: 'O(n) time and O(n) space for the chain. The visualization caps input at 10 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["e","a","b"],"groups":[0,0,1]}' },
    { label: 'Alternating', input: '{"words":["a","b","c","d"],"groups":[1,0,1,1]}' },
  ],
}

export default function UnequalGroupsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={i => `${run.input.words[i]} (g${run.input.groups[i]})`}
      active={step.index ?? -1} roleAt={i => (step.chain.includes(run.input.words[i]) && i <= step.index ? 'taken' : '')} />
    <p aria-label="Chain">{`Chain: ${step.chain.join(', ') || '(empty)'}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the group label matters here, so a greedy pass is enough: whenever the group changes, the word can be taken without losing any later choice.</p>
  </>} />
}
