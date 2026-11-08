import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'key', label: 'Reflect', description: 'Reverse the binary digits of each number.' },
    { id: 'sort', label: 'Sort', description: 'Order the numbers by reflection, then by value.' },
    { id: 'done', label: 'Complete', description: 'Report the sorted array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/sort-integers-by-binary-reflection/',
  complexity: 'O(n log n) comparisons, each with an O(log V) reflection. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,5,4]}' },
    { label: 'Example 2', input: '{"nums":[3,6,5,8]}' },
    { label: "Single value", input: "{\"nums\":[9]}" },
    { label: "Equal values", input: "{\"nums\":[5,5,5]}" },
    { label: "Alternating extremes at length 20", input: "{\"nums\":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1]}" },
    { label: "Long run: 20 values", input: "{\"nums\":[577,558,155,681,39,349,637,78,465,456,813,737,213,851,82,350,559,3,957,873]}" },
  ],
}

export default function SortByBinaryReflection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i <= step.index ? `reflects to ${run.reflections[i]}` : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Reversing binary digits drops leading zeros, so 4 (100) reflects to 1. Equal reflections are ordered by the original value.</p>
  </>} />
}
