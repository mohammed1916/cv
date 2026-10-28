import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a running total of zero.' },
    { id: 'query', label: 'Update', description: 'Set the queried position to its new value.' },
    { id: 'element', label: 'Scan', description: 'Track the best sum that takes or skips each value.' },
    { id: 'record', label: 'Record', description: 'Add the best sum of this array to the total.' },
    { id: 'done', label: 'Complete', description: 'Report the total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries of [position, value] (JSON)',
  url: 'https://leetcode.com/problems/maximum-sum-of-subsequence-with-non-adjacent-elements/',
  complexity: 'O(n * q) time for the scans in this trace, with the total kept modulo 1000000007. The visualization caps nums at 8 values and queries at 5.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,5,9],"queries":[[1,-2],[0,-3]]}' },
    { label: 'Example 2', input: '{"nums":[0,-1],"queries":[[0,-5]]}' },
  ],
}

export default function MaximumSumNonAdjacent() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array after the query" length={step.values.length} valueAt={i => step.values[i]} active={step.index}
      roleAt={i => (i === step.index && step.phase === 'query' ? 'updated' : '')} />
    <output aria-label="Scan state">{step.phase === 'element'
      ? `Skipped ${step.skipped}, taken ${step.taken === null ? 'none' : step.taken}, total ${step.total}`
      : `Total ${step.total} of ${run.input.queries.length} queries`}</output>
  </>} renderReasoning={() => <>
    <p>Two running values describe each prefix: the best sum where the last value is skipped, and the best sum where it is taken.</p>
    <p>Taking a value is only allowed right after a skipped one, so no two chosen values are adjacent. The empty choice is allowed, which is why the answer is never negative.</p>
  </>} />
}
