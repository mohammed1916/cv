import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Check', description: 'Check that no value is below k.' },
    { id: 'level', label: 'Level', description: 'Each distinct value above k costs one operation.' },
    { id: 'stuck', label: 'Impossible', description: 'A value below k cannot be raised.' },
    { id: 'done', label: 'Complete', description: 'Report the number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 12 integers from 1 to 10) and k, for example {"nums":[5,2,5,4,5],"k":2}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-values-equal-to-k/',
  complexity: 'O(n) time for the checks and the distinct count. The visualization caps the array at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,2,5,4,5],"k":2}' },
    { label: 'Example 2', input: '{"nums":[3,1],"k":2}' },
  ],
}

export default function EqualToK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => {
        const v = run.input.nums[index]
        if (v > run.input.k) return 'above k'
        return v === run.input.k ? 'at k' : 'below k'
      }} />
    <output aria-label="Operations">{`Target k = ${run.input.k}. Operations so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>An operation can only lower values, and values below k can never rise, so any value below k makes the task impossible.</p>
    <p>Each distinct value above k needs one operation to bring it down to the next level, so the count is the number of distinct levels above k.</p>
  </>} />
}
