import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has residue 0.' },
    { id: 'prefix', label: 'Extend', description: 'Decide whether a block ends at this element.' },
    { id: 'done', label: 'Result', description: 'Report the remaining sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 20 positive integers) and k',
  url: 'https://leetcode.com/problems/minimum-sum-after-divisible-sum-deletions/description/',
  complexity: 'O(n + k) time and O(n + k) space: one pass over the prefix sums with a best value per residue.',
  examples: [
    { label: 'Invented example', input: '{"nums":[2,5,4,3,6],"k":3}' },
    { label: 'Nothing divisible', input: '{"nums":[1,2,4],"k":5}' },
  ],
}

export default function MinimumSumAfterDivisibleSumDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.index >= 0 ? step.index : -1}
      roleAt={i => step.removed && step.removed[i] ? 'deleted' : ''} />
    <output aria-label="Deletion state">{step.result !== undefined
      ? `remaining sum ${step.result}`
      : `residue ${step.residue ?? 0}, removed so far ${step.removedSum}`}</output>
  </>} renderReasoning={() => <>
    <p>A deleted stretch sums to a multiple of k exactly when its two bounding prefix sums share a residue mod k.</p>
    <p>For each residue, the code keeps the best value of (removed total up to a start) minus that prefix sum, so every new element is handled in constant time.</p>
    <p>This teaching model is knowledge-derived and not verified against the official judge.</p>
  </>} />
}
