import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'range', label: 'Extremes', description: 'Find the largest and smallest values.' },
    { id: 'pick', label: 'Pick', description: 'Choose the whole array k times.' },
    { id: 'done', label: 'Result', description: 'The total value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/maximum-total-subarray-value-i/',
  complexity: 'O(n) time for the maximum and minimum, O(1) extra space.',
  examples: [
    { label: 'Example', input: '{"nums":[4,-2,7,1],"k":3}' },
    { label: 'Flat', input: '{"nums":[5,5],"k":2}' },
  ],
}

export default function MaximumTotalSubarrayValueI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.chosen && i === step.chosen[0] ? 'l' : step.chosen && i === step.chosen[1] ? 'r' : step.chosen && i > step.chosen[0] && i < step.chosen[1] ? 'span' : (run.input.nums[i] === step.largest ? 'largest' : (run.input.nums[i] === step.smallest ? 'smallest' : '')))} />
    <output aria-label="Total value">{`range ${step.largest} - ${step.smallest}; total so far ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray can never be wider than the whole array, so the widest possible single value is the whole array's range.</p>
    <p>Since overlaps and repeats are allowed, choosing that one subarray k times is optimal.</p>
  </>} />
}
