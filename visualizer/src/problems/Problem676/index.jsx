import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Dictionary', description: 'Load the dictionary words.' },
    { id: 'search', label: 'Search query', description: 'Find a word that differs in exactly one letter.' },
    { id: 'done', label: 'Complete', description: 'All queries answered.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Dictionary and queries (JSON object with words and queries)',
  url: 'https://leetcode.com/problems/implement-magic-dictionary/',
  complexity: 'O(D · L) per query for D words of length L in this visualization; a trie or set of wildcard keys gives O(L · 26) per query.',
  examples: [
    { label: 'One change', input: '{"words":["hello","leetcode"],"queries":["hello","hhllo","hell","leetcoded"]}' },
  ],
}

export default function MagicDictionary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <OperationLog title="Queries" ops={step.ops} current={step.ops.length - 1} />
    <output aria-label="Dictionary">Dictionary: {run.input.words.join(', ')}{step.witness ? ` · matched ${step.witness}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Exactly one change:</strong> a match needs the same length and one differing position; zero differences (the same word) does not count.</p>
  </>} />
}
