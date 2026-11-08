import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a count of zero.' },
    { id: 'check', label: 'Check value', description: 'Compare the odd and even position digit sums.' },
    { id: 'done', label: 'Complete', description: 'Report how many values in the range are balanced.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Range (JSON object with low and high)',
  url: 'https://leetcode.com/problems/number-of-balanced-integers-in-a-range/',
  complexity: 'O(range * digits) time in this visualization. The problem allows values up to 10^15, which needs digit dynamic programming. The visualization caps the range at 301 values.',
  examples: [
    { label: 'Example 1', input: '{"low":2000,"high":2019}' },
    { label: 'Example 2', input: '{"low":1100,"high":1199}' },
    { label: "Single number", input: "{\"low\":1,\"high\":1}" },
    { label: "Equal bounds", input: "{\"low\":2000,\"high\":2000}" },
    { label: "Top of the range, 301 numbers", input: "{\"low\":2700,\"high\":3000}" },
    { label: "Long run: 301 numbers", input: "{\"low\":1222,\"high\":1522}" },
  ],
}

export default function NumberOfBalancedIntegersInARange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { low, high } = run.input
    return <IndexedSequence label="Values in range" length={high - low + 1} valueAt={i => low + i} active={step.offset}
      roleAt={i => (run.flags[i] ? 'balanced' : '')} indexOffset={low} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A value is balanced when it has at least two digits and its odd-position digits sum to the same total as its even-position digits.</p>
  </>} />
}
