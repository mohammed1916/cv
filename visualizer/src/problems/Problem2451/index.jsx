import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2451',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with no patterns counted.' },
    { id: 'diff', label: 'Differences', description: 'Compute the adjacent letter differences of a word.' },
    { id: 'tally', label: 'Tally', description: 'Count the pattern once more.' },
    { id: 'check', label: 'Check', description: 'Look for a word whose pattern appears once.' },
    { id: 'done', label: 'Result', description: 'Return the odd word.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"words": ["adc","wzy","abc"]}',
  url: 'https://leetcode.com/problems/odd-string-difference/',
  complexity: 'O(n * L) time and O(n * L) space for n words of length L. The visualization caps input at 10 words of up to 8 letters.',
  examples: [
    { label: 'Own: four-letter words', input: '{"words":["mnop","nopq","qwer","ghij"]}' },
    { label: 'Own: three letter words', input: '{"words":["abc","bcd","ace","bdf","axz"]}' },
    { label: 'Length two words', input: '{"words":["ab","ba","ba"]}' },
    { label: 'Shared difference pattern', input: '{"words":["abc","bcd","zzz"]}' },
    { label: 'Largest size', input: '{"words":["bcdefghi","bcdefghi","bcdefghi","bcdefghi","bcdefghi","bcdefghi","bcdefghi","bcdefghi","bcdefghi","zyxwvuts"]}' },
    { label: 'Long run: 10 words', input: '{"words":["jcdgmdck","kdehnedl","lefiofem","mfgjpgfn","nghkqhgo","ohilrihp","pijmsjiq","qjkntkjr","rkloulks","zzzzzzzz"]}' },
  ],
}

export default function OddStringDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.at}
      roleAt={i => (step.phase === 'done' && i === step.at ? 'odd' : '')} />
    <FrequencyCountTable title="Difference patterns" entries={step.counts} active={step.key} emptyText="No pattern counted yet." />
    <output aria-label="Odd string check">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two words are alike when every adjacent pair of letters moves by the same amount. The difference pattern captures that movement, and it does not depend on the starting letter.</p>
    <p>Count each pattern in a map. Exactly one word has a pattern that appears once, and that word is the answer.</p>
  </>} />
}
