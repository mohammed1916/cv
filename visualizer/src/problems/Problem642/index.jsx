import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Load history', description: 'Store every sentence with its hotness.' },
    { id: 'input', label: 'Type a character', description: 'Extend the prefix and rank the matching sentences.' },
    { id: 'save', label: 'Save with #', description: 'The typed sentence gains one count and the prefix resets.' },
    { id: 'done', label: 'Complete', description: 'Report the suggestions after each character.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentences, hotness and typed text (JSON)',
  url: 'https://leetcode.com/problems/design-search-autocomplete-system/',
  complexity: 'Each character scans the stored sentences. The visualization caps input at 10 sentences and 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"sentences":["i love you","island","ironman","i love leetcode"],"times":[5,3,2,2],"typed":"i a#"}' },
    { label: 'Saving', input: '{"sentences":["abc","abd"],"times":[1,1],"typed":"abd#ab"}' },
  ],
}

export default function DesignAutocomplete() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p aria-label="Typed so far">Prefix: <code>{step.typed || '(empty)'}</code></p>
    <IndexedSequence label="Suggestions (hottest first)" length={step.top.length} valueAt={i => `${step.top[i][0]} (${step.top[i][1]})`} />
  </>} renderReasoning={() => <>
    <p>A trie or a scan can both find the sentences that start with the typed prefix. The ranking is by hotness, then by ASCII order, and only the top three are shown.</p>
    <p>A # records the typed sentence. It is the only operation that changes the counts, so later prefixes see the new hotness.</p>
  </>} />
}
