import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Lookups', description: 'Build the exact, case-insensitive and vowel-insensitive lookups.' },
    { id: 'query', label: 'Check a query', description: 'Try the three rules in order; the first match is the answer.' },
    { id: 'done', label: 'Complete', description: 'Report the corrected words.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'wordlist and queries (JSON)',
  url: 'https://leetcode.com/problems/vowel-spellchecker/',
  complexity: 'O(total length) time with hash lookups. The visualization caps input at 10 words and 10 queries.',
  examples: [
    { label: 'Example 1', input: '{"wordlist":["KiTe","kite","hare","Hare"],"queries":["kite","Kite","KiTe","Hare","HARE","Hear","hear","keti","keet","keto"]}' },
  ],
}

export default function VowelSpellchecker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Queries" length={run.input.queries.length} active={step.query === null ? -1 : run.input.queries.indexOf(step.query)}
      valueAt={i => run.input.queries[i]} />
    <output aria-label="Current query">
      {step.query === null ? step.message : `${step.query} → ${step.stage === 4 ? '(no match)' : step.match} (rule ${step.stage})`}
    </output>
  </>} renderReasoning={() => <>
    <p>Three rules, tried in order: an exact match is returned as is, then a match that ignores case, then a match that also ignores vowels. Each lookup keeps only the first word in the list.</p>
    <p>If nothing matches, the answer is the empty string.</p>
  </>} />
}
