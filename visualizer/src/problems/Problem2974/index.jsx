import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the values in ascending order.' },
    { id: 'round', label: 'Round', description: 'Alice removes the smallest, Bob removes the next smallest, then they append in reverse order.' },
    { id: 'done', label: 'Complete', description: 'Report the final array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with an even-length integer array nums (values 1 to 100)',
  url: 'https://leetcode.com/problems/minimum-number-game/',
  complexity: 'O(n log n) time for the sort. The visualization caps the array at twenty values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,4,2,3]}' },
    { label: 'Example 2', input: '{"nums":[2,5]}' },
    { label: "Two equal values", input: '{"nums":[9,9]}' },
    { label: "Largest values alternate", input: '{"nums":[100,1,100,1]}' },
    { label: "Six equal values", input: '{"nums":[6,6,6,6,6,6]}' },
    { label: "Long run: 20 values", input: '{"nums":[36,36,29,59,49,17,69,40,61,69,20,96,63,40,72,2,32,25,81,23]}' },
  ],
}

export default function MinimumNumberGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={run.sorted.length} valueAt={index => run.sorted[index]} active={step.index} roleAt={index => (step.index >= 0 && index <= step.index + 1 ? 'removed' : '')} />
    <output aria-label="Arr">{`Output so far: ${step.arr.join(', ') || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each round, Alice and Bob remove the two smallest values in turn, so the pairs of the sorted array are exactly the rounds.</p>
    <p>Within a round Bob's value is appended first, which swaps each pair in the output.</p>
  </>} />
}
