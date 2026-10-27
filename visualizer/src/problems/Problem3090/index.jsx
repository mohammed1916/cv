import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty tally of letters.' },
    { id: 'extend', label: 'Extend', description: 'Add the letter at the right edge.' },
    { id: 'shrink', label: 'Shrink', description: 'A letter reached a third occurrence, so drop letters from the left.' },
    { id: 'record', label: 'Record', description: 'Keep the longest valid substring seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest substring.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lowercase string s (JSON)',
  url: 'https://leetcode.com/problems/maximum-length-substring-with-two-occurrences/',
  complexity: 'O(n) time and O(1) extra space for 26 letters. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"bcbbbcba"}' },
    { label: 'Repeat', input: '{"s":"aaaa"}' },
  ],
}

export default function TwoOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.right}
      roleAt={i => (step.right >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Tally">{`Tally: ${Object.entries(step.counts).map(([v, c]) => `${v}×${c}`).join(', ') || 'empty'}; best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the letter just added can reach a third occurrence, so the left edge moves only until that letter is back to two.</p>
  </>} />
}
