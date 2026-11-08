import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TrieStateDiagram from '../../components/shared/TrieStateDiagram'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON list of lowercase strings)',
  url: 'https://leetcode.com/problems/sum-of-prefix-scores-of-strings/',
  complexity: 'O(total length) time and space for the trie. The visualization caps input at 6 words of up to 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["abc","ab","bc","b"]}' },
    { label: 'Single word', input: '{"words":["abcd"]}' },
    { label: 'Single letter', input: '{"words":["a"]}' },
    { label: 'Duplicate words', input: '{"words":["ab","ab","ab"]}' },
    { label: 'Longest words', input: '{"words":["abcdef","bcdef","cdef","def"]}' },
    { label: 'Long run: 6 words', input: '{"words":["h","qummm","e","lhm","mmom","hucxx"]}' },
  ],
}

export default function SumOfPrefixScores() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <TrieStateDiagram nodes={step.nodes} activeNode={step.activeNode} />
    <p className="algorithm-readout">Each node shows how many words pass through its prefix. A word's score adds those counts along its own path.</p>
    <output aria-label="Scores">{`Answer so far: ${step.answer.join(', ') || 'none'}${step.score === null ? '' : `. Current word score ${step.score}`}`}</output>
  </>} renderReasoning={() => <>
    <p>A prefix shared by several words is one trie node, and its pass count is how many words go through it.</p>
    <p>The score of a word is the sum of pass counts along its path, so the work is proportional to the total length of the words.</p>
  </>} />
}
