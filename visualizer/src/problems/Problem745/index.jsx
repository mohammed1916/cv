import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Constructor', description: 'Describe the precomputed key table.' },
    { id: 'insert', label: 'Insert word', description: 'Add every suffix#prefix key of the word with its index.' },
    { id: 'query', label: 'Query f', description: 'Look up suffix#prefix in the table.' },
    { id: 'done', label: 'Complete', description: 'All queries answered.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Words and queries (JSON)',
  url: 'https://leetcode.com/problems/prefix-and-suffix-search/',
  complexity: 'Constructor O(sum of len^3) time and O(sum of len^2) keys; each query O(len). Capped at 12 words of 7 letters and 20 queries.',
  examples: [
    { label: 'Example 1', input: '{"words": ["apple"], "queries": [["a", "e"], ["b", ""]]}' },
    { label: 'Later index wins', input: '{"words": ["apple", "ape", "apple"], "queries": [["ap", "e"], ["ap", "pe"], ["", "le"], ["x", "x"]]}' },
  ],
}

export default function PrefixAndSuffixSearch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} active={step.phase === 'insert' ? step.wordIndex : step.phase === 'query' ? step.wordIndex : -1} valueAt={i => run.input.words[i]} />
    {step.keys.length > 0 && <IndexedSequence label="Keys added for the current word (suffix#prefix)" length={step.keys.length} valueAt={i => step.keys[i]} />}
    <OperationLog title="Queries" ops={run.input.queries.map(([p, s], i) => ({ name: 'f', args: [p, s], returned: run.result[i] }))} current={step.queryIndex} through={step.phase === 'done' ? run.input.queries.length - 1 : step.queryIndex} />
    <output aria-label="Table size">Table keys: {step.tableSize}{step.key ? ` | looked up "${step.key}"` : ''}</output>
  </>} renderReasoning={() => <>
    <p>The query needs a word with the given prefix and suffix at once. Joining suffix and prefix with a separator turns that into one exact key, and storing keys in word order keeps only the largest index per key.</p>
  </>} />
}
