import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Baseline', description: 'Measure the longest alternating run with nothing removed.' },
    { id: 'remove', label: 'Try a removal', description: 'Delete one element and measure the longest alternating run.' },
    { id: 'done', label: 'Complete', description: 'Report the best run over all choices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/longest-alternating-subarray-after-removing-at-most-one-element/',
  complexity: 'O(n^2) time for this teaching version (one scan per removal). The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,2]}' },
    { label: 'Example 2', input: '{"nums":[3,2,1,2,3,2,1]}' },
    { label: 'Equal pair', input: '{"nums":[100000,100000]}' },
  ],
}

export default function LongestAlternatingAfterRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === step.index && step.phase === 'remove' ? 'removed' : '')} />
    <output aria-label="Best run">{`Removed index: ${step.index < 0 ? 'none' : step.index}, run: ${step.run}, best: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only one deletion is allowed, so the search tries nothing removed and each single index. For each choice, the run is measured on the array that remains.</p>
  </>} />
}
