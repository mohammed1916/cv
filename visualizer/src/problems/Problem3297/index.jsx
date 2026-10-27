import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the total at zero.' },
    { id: 'extend', label: 'Extend', description: 'Add the next letter to the counts for this start.' },
    { id: 'count', label: 'Count', description: 'Once the counts cover word2, every later end from this start works.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word1 and word2',
  url: 'https://leetcode.com/problems/count-substrings-that-can-be-rearranged-to-contain-a-string-i/',
  complexity: 'O(n^2 * 26) time in the worst case. The visualization caps word1 at 12 letters and word2 at 5.',
  examples: [
    { label: 'Example 1', input: '{"word1":"bcca","word2":"abc"}' },
    { label: 'Example 2', input: '{"word1":"abcabc","word2":"abc"}' },
    { label: 'Example 3', input: '{"word1":"abcabc","word2":"aaabc"}' },
  ],
}

export default function RearrangeableSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="word1" length={run.input.word1.length} valueAt={i => run.input.word1[i]} active={step.end}
      roleAt={i => (i >= step.start && i <= step.end ? 'window' : '')} />
    <output aria-label="Counts">{`Substring ${step.start} to ${step.end}: counts ${step.have || 'none'}. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Rearranging a substring only needs enough of each letter, not the order, so counting letters is the whole test.</p>
  </>} />
}
