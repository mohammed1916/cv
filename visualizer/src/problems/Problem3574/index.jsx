import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the best score at zero.' },
    { id: 'start-index', label: 'Start index', description: 'Check every subarray that begins at this index.' },
    { id: 'done', label: 'Complete', description: 'Report the best length times gcd.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/maximize-subarray-gcd-score/',
  complexity: 'O(n^2 * k * states) time for the reachable (doublings, gcd) pairs. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,4],"k":1}' },
    { label: 'Example 2', input: '{"nums":[3,5,7],"k":2}' },
  ],
}

export default function MaximizeSubarrayGcdScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.range ? step.range[0] : -1} />
    <output aria-label="Best">{`Best score: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Doubling an element only matters for the gcd, so each subarray keeps the best gcd for each number of doublings used.</p>
  </>} />
}
