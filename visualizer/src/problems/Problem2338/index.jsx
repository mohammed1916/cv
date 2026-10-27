import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the answer to zero.' },
    { id: 'chains', label: 'Chains', description: 'Count the divisor chains that end at this value.' },
    { id: 'add', label: 'Add', description: 'Weight those chains by the ways to repeat their values.' },
    { id: 'done', label: 'Complete', description: 'Report the count modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and max_value (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-ideal-arrays/',
  complexity: 'O(maxValue^2) time for the chain table plus a log factor per binomial. The visualization caps n at 12 and max_value at 40.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"max_value":5}' },
    { label: 'Example 2', input: '{"n":5,"max_value":3}' },
  ],
}

export default function IdealArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Chains ending at each value" length={run.input.max_value} indexOffset={1}
      valueAt={i => run.chainTotals[i + 1]} active={Math.max(0, step.v - 1)}
      roleAt={i => (i + 1 <= step.v ? 'done' : '')} />
    <output aria-label="Running total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each element is a multiple of the one before it, so the array is a divisor chain of distinct values with repeats.</p>
    <p>A chain of k distinct values stretched to length n can be formed in choose(n - 1, k - 1) ways.</p>
  </>} />
}
