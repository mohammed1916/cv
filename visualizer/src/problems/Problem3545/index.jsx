import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the string and the limit k.' },
    { id: 'count', label: 'Count letters', description: 'Tally each letter as it is read.' },
    { id: 'rank', label: 'Rank', description: 'Order the letters by frequency.' },
    { id: 'keep', label: 'Keep top k', description: 'Keep the k most frequent letters.' },
    { id: 'done', label: 'Complete', description: 'Report the deletions.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with string s and integer k',
  url: 'https://leetcode.com/problems/minimum-deletions-for-at-most-k-distinct-characters/',
  complexity: 'O(n + u log u) time, where u is the number of distinct letters. The visualization caps the string at 30 letters.',
  examples: [
    { label: 'Two pairs', input: '{"s":"aabbcc","k":1}' },
    { label: 'Already fits', input: '{"s":"abcabc","k":3}' },
  ],
}

export default function MinimumDeletionsAtMostK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const roleAt = i => {
      if (step.kept) return step.kept.includes(s[i]) ? 'kept' : 'deleted'
      return step.index >= 0 && i <= step.index ? 'seen' : ''
    }
    return <>
      <IndexedSequence label="String" length={s.length} valueAt={i => s[i]} active={step.index} roleAt={roleAt} />
      <FrequencyCountTable title="Letter counts" entries={step.counts} active={step.index >= 0 ? s[step.index] : null} />
      <output aria-label="Kept letters">{step.kept ? `Kept: ${step.kept.join(', ') || 'none'}.` : 'Kept letters are chosen after the counts are ranked.'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Keeping the most frequent letters removes the fewest characters, so only the top k letter counts matter.</p>
    <p>Every occurrence of a letter that is not kept is deleted, so the answer is the length of the string minus the kept total.</p>
  </>} />
}
