import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty tally.' },
    { id: 'tally', label: 'Tally', description: 'Count one more occurrence of this value.' },
    { id: 'top', label: 'Largest count', description: 'Find the highest frequency.' },
    { id: 'sum', label: 'Add matches', description: 'Add the elements of each value that has the largest frequency.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers 1 to 5 (JSON array, up to 12 entries)',
  url: 'https://leetcode.com/problems/count-elements-with-maximum-frequency/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[1,2,2,3,1,4]' },
    { label: 'All distinct', input: '[1,2,3,4,5]' },
  ],
}

export default function CountMaxFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index ?? -1}
      roleAt={i => (i <= step.index ? 'seen' : '')} />
    <p aria-label="Counts">{`Counts: ${Object.entries(step.counts ?? {}).map(([v, c]) => `${v} x${c}`).join(', ') || '(none)'}`}</p>
    <p aria-label="Total">{`Largest frequency: ${step.top || '(not yet)'}; total: ${step.total}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>An element counts toward the answer exactly when its value has the largest frequency, so the answer is the sum of those frequencies.</p>
  </>} />
}
