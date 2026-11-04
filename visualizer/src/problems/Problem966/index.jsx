import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Lookups', description: 'Build the exact, case-insensitive and vowel-insensitive lookups.' },
    { id: 'query', label: 'Check a query', description: 'Try the three rules in order; the first match is the answer.' },
    { id: 'done', label: 'Complete', description: 'Report the corrected words.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'wordlist and queries (JSON)',
  url: 'https://leetcode.com/problems/vowel-spellchecker/',
  complexity: 'O(total length) time with hash lookups. The visualization caps input at 10 words and 10 queries.',
  examples: [
    { label: 'Example 1', input: '{"wordlist":["Mouse","mouse","rat"],"queries":["MOUSE","rat","Rot","RAT"]}' },
  ],
}

export default function VowelSpellchecker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Queries" length={run.input.queries.length} active={step.query === null ? -1 : run.input.queries.indexOf(step.query)}
      valueAt={i => run.input.queries[i]} />
    <HashMapView maps={(() => {
      const words = run.input.wordlist
      const lower = new Map(), vowel = new Map()
      for (const w of words) {
        if (!lower.has(w.toLowerCase())) lower.set(w.toLowerCase(), w)
        const d = w.toLowerCase().replace(/[aeiou]/g, '*')
        if (!vowel.has(d)) vowel.set(d, w)
      }
      return [
        { name: 'exact', isSet: true, keyLabel: 'word', valueLabel: '', entries: [...new Set(words)].map(w => [w]) },
        { name: 'lower', isSet: false, keyLabel: 'lowercase', valueLabel: 'first word', entries: [...lower.entries()] },
        { name: 'vowel', isSet: false, keyLabel: 'pattern', valueLabel: 'first word', entries: [...vowel.entries()] },
      ]
    })()} />
    <output aria-label="Current query">
      {step.query === null ? step.message : `${step.query} → ${step.stage === 4 ? '(no match)' : step.match} (rule ${step.stage})`}
    </output>
  </>} renderReasoning={() => <>
    <p>Three rules, tried in order: an exact match is returned as is, then a match that ignores case, then a match that also ignores vowels. Each lookup keeps only the first word in the list.</p>
    <p>If nothing matches, the answer is the empty string.</p>
  </>} />
}
