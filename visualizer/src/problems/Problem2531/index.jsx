import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count letters', description: 'Count the letters of each word.' },
    { id: 'try', label: 'Try a swap', description: 'Try swapping one letter from each word.' },
    { id: 'found', label: 'Match found', description: 'The counts match after a swap.' },
    { id: 'done', label: 'Complete', description: 'No swap makes the counts match.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word1 and word2 (JSON)',
  url: 'https://leetcode.com/problems/make-number-of-distinct-characters-equal/',
  complexity: 'O(a * b) time for a and b distinct letters, using counts only. The visualization caps each word at 20 letters.',
  examples: [
    { label: 'Swap works', input: '{"word1":"abcc","word2":"aab"}' },
    { label: 'No swap works', input: '{"word1":"ab","word2":"abcc"}' },
  ],
}

export default function MakeDistinctEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div className="frequency-count-pair">
      <FrequencyCountTable title="word1 letters" entries={step.c1} active={step.pair ? step.pair[0] : null} />
      <FrequencyCountTable title="word2 letters" entries={step.c2} active={step.pair ? step.pair[1] : null} />
    </div>
    <output aria-label="Swap under test">{step.pair ? `Swap ${step.pair[0]} (word1) with ${step.pair[1]} (word2): distinct counts ${step.n1} and ${step.n2}.` : `Distinct counts: ${step.d1} and ${step.d2}.`}</output>
  </>} renderReasoning={() => <>
    <p>A swap only changes the counts of the two letters involved, so the distinct count of each word can be updated in constant time.</p>
    <p>Swapping a letter with itself changes nothing, so that case is judged by the original counts.</p>
  </>} />
}
