import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No value has been kept yet.' },
    { id: 'take', label: 'Keep', description: 'A positive value new to the set is kept.' },
    { id: 'skip', label: 'Skip', description: 'The value is not positive or was already kept.' },
    { id: 'done', label: 'Result', description: 'Report the chosen total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers (1 to 12 entries)',
  url: 'https://leetcode.com/problems/maximum-unique-subarray-sum-after-deletion/',
  complexity: 'O(n) time and O(n) space. The visualization caps the input at 12 values.',
  examples: [
    { label: 'Example 1', input: '[3,-2,3,5]' },
    { label: 'Example 2', input: '[-4,-1,-7]' },
    { label: 'Example 3', input: '[2,2,6,-1]' },
    { label: 'Single value', input: '[5]' },
    { label: 'Equal values', input: '[4,4,4]' },
    { label: 'Extreme values', input: '[-100,100,-100,100]' },
    { label: 'All negative', input: '[-3,-7,-1]' },
    { label: 'Long run: 12 values', input: '[49,44,38,-76,88,51,29,-28,78,65,-15,59]' },
  ],
}

export default function MaximumUniqueSubarraySumAfterDeletion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.phase === 'take' && i === step.at ? 'kept' : '')} />
    <output aria-label="Running total">{`total = ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Deletions let any set of positions remain, so a subarray with distinct values can contain any set of distinct values. Positive values only add to the total, so each distinct positive value is kept once.</p>
    <p>If no value is positive, every kept subarray has a sum at most the largest value, and that single element is the best choice.</p>
  </>} />
}
