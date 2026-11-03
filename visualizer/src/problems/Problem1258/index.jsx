import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ChoiceColumnsView from './ChoiceColumnsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1258',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with synonyms ([a, b] pairs) and text (single-space sentence)',
  url: 'https://leetcode.com/problems/synonymous-sentences/description/',
  complexity: 'O(p α(w) + S * n) time for p pairs, w words, S distinct sentences of n words, plus sorting. The visualization caps pairs at 10, words at 8, and combinations at 64; the draft does not state an exact official bound.',
  examples: [
    { label: 'Two groups', input: '{"synonyms":[["happy","joy"],["sad","sorrow"],["joy","cheerful"]],"text":"I am happy today but was sad"}' },
    { label: 'One pair', input: '{"synonyms":[["big","large"]],"text":"big house"}' },
    { label: 'No synonyms', input: '{"synonyms":[],"text":"plain text"}' },
  ],
}

export default function Problem1258SynonymousSentences() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChoiceColumnsView run={run} step={step} />}
      renderReasoning={() => (
        <p>Synonym pairs are merged into groups first, so transitive links such as happy–joy and joy–cheerful share one group. Each word then chooses one member of its group, and every combination is a candidate sentence.</p>
      )}
    />
  )
}
