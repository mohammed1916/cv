import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count how many words share each prefix.' },
    { id: 'remove', label: 'Remove', description: 'Take one word out of the counts.' },
    { id: 'record', label: 'Record', description: 'Record the longest prefix still shared by k words, then put the word back.' },
    { id: 'done', label: 'Complete', description: 'Report the answer for every removal.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with words (2 to 8 lowercase words, up to 5 letters) and k (1 to words minus 1)',
  url: 'https://leetcode.com/problems/longest-common-prefix-of-k-strings-after-removal/',
  complexity: 'O(n * L^2) time for n words of length L, using prefix counts. The visualization caps the input at 8 words.',
  examples: [
    { label: 'Example', input: '{"words":["jump","run","run","jump","run"],"k":2}' },
    { label: 'Single word', input: '{"words":["ab","abc","a"],"k":1}' },
  ],
}

export default function LongestPrefixAfterRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={index => run.input.words[index]} active={step.removed} />
    <output aria-label="Answers">{`Answers so far: [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Two words share a prefix of length d exactly when their first d letters match, so the number of words sharing each prefix is a count that can be updated.</p>
    <p>Removing a word lowers the counts of only its own prefixes, so each removal needs one pass over those prefixes and then one restore.</p>
  </>} />
}
