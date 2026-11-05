import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import PrefixSuffixChain from './PrefixSuffixChain'

const definition = {
  phases: [
    { id: 'start', label: 'Empty trie', description: 'Start with no words stored.' },
    { id: 'check', label: 'Match', description: 'Walk the word’s letter pairs and add the counts found on the way.' },
    { id: 'insert', label: 'Store', description: 'Store the word’s letter pairs in the trie.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON list of lowercase strings)',
  url: 'https://leetcode.com/problems/count-prefix-and-suffix-pairs-ii/',
  complexity: 'O(total length) time and space, because each word is walked once for matching and once for storing. The visualization caps input at 8 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["x","xy","xyx","xyxy"]}' },
    { label: 'Example 2', input: '{"words":["bo","bobo","ob","bob"]}' },
  ],
}

export default function CountPrefixSuffixPairsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PrefixSuffixChain run={run} step={step} />
    <p><strong>Current word:</strong> {step.word ?? 'none'}</p>
    <output aria-label="Trie count">{`${step.message} Total ${step.total}.`}</output>
  </>} renderReasoning={() => <>
    <p>A word is a prefix and suffix of another word exactly when its letter pairs, read from the outside in, match the start of the other word’s pairs.</p>
    <p>The trie stores each earlier word’s pair path with a count of words ending there, so one walk collects every match.</p>
  </>} />
}
