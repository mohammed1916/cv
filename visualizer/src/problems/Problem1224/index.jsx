import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with empty count and frequency tables.' },
    { id: 'add', label: 'Add value', description: 'Raise the count of the next value by one.' },
    { id: 'check', label: 'Check prefix', description: 'Test whether removing one element makes every count equal.' },
    { id: 'done', label: 'Complete', description: 'Report the longest fair prefix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers 1 to 5 (JSON array, up to 12 entries)',
  url: 'https://leetcode.com/problems/maximum-equal-frequency/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[2,2,1,1,5,3,3,5]' },
    { label: 'Three equal groups', input: '[1,1,1,2,2,2]' },
  ],
}

export default function MaximumEqualFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index ?? -1}
      roleAt={i => (i <= step.index ? 'prefix' : '')} />
    <p aria-label="Counts">{`Counts: ${Object.entries(step.counts ?? {}).map(([v, c]) => `${v} x${c}`).join(', ') || '(none)'}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Fairness of a prefix depends only on the largest count and how many values have each count.</p>
    <p>Removing one element can fix the prefix in three ways: all values are unique, one value has the largest count and the rest are one smaller, or one singleton value is removed and the rest are equal.</p>
  </>} />
}
