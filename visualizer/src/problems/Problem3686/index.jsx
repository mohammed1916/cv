import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequences are counted yet.' },
    { id: 'add', label: 'Add value', description: 'Count the subsequences that gain this value.' },
    { id: 'done', label: 'Complete', description: 'Sum all counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 100000 (JSON, up to 12 values)',
  url: 'https://leetcode.com/problems/number-of-stable-subsequences/',
  complexity: 'O(n) time and O(1) space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '[1,3,5]' },
    { label: 'Example 2', input: '[2,3,4,2]' },
  ],
}

export default function StableSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (run.input[index] % 2 === 0 ? 'even' : 'odd')} />
    <output aria-label="Counts">{`Run 1 (odd, even): ${step.run1.join(', ')}. Run 2 (odd, even): ${step.run2.join(', ')}. Total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A subsequence is stable unless its last three elements share a parity, so only the length of the trailing same-parity run matters: one or two.</p>
    <p>Each new value either starts a subsequence, extends a subsequence ending in the other parity, or extends a run of one of the same parity into a run of two.</p>
  </>} />
}
