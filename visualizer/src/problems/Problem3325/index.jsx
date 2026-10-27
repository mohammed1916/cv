import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the total at zero.' },
    { id: 'extend', label: 'Extend', description: 'Add the next letter and update its count from this start.' },
    { id: 'count', label: 'Count', description: 'Once a letter reaches k, all later ends from this start count.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and k',
  url: 'https://leetcode.com/problems/count-substrings-with-k-frequency-characters-i/',
  complexity: 'O(n^2) time in the worst case and O(1) extra space for 26 letters. The visualization caps input at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abacb","k":2}' },
    { label: 'Example 2', input: '{"s":"abcde","k":1}' },
  ],
}

export default function KFrequencySubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.end}
      roleAt={i => (i >= step.start && i <= step.end ? 'window' : '')} />
    <output aria-label="Count">{`Substring ${step.start} to ${step.end}: ${step.letter || 'none'} seen ${step.count} of ${run.input.k} times. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once a substring reaches the frequency, extending it to the right keeps the property, so the rest of the ends are counted in one step.</p>
  </>} />
}
