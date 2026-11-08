import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the cost of an empty prefix.' },
    { id: 'candidate', label: 'Window', description: 'The window from l to r has the required AND, so it can end a piece.' },
    { id: 'piece', label: 'Piece', description: 'Keep the cheapest prefixes that end a piece with the required AND.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest split of the whole array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and targets (JSON object with nums and and_values)',
  url: 'https://leetcode.com/problems/minimum-sum-of-values-by-dividing-array/',
  complexity: 'O(m * n^2) time and O(n) space in this trace. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,5,6,2,7],"and_values":[1,2]}' },
    { label: 'Example 2', input: '{"nums":[4,6,4,5,6,7],"and_values":[4,4,6]}' },
    { label: "Single value", input: "{\"nums\":[5],\"and_values\":[5]}" },
    { label: "Equal values", input: "{\"nums\":[6,6,6],\"and_values\":[6]}" },
    { label: "Largest values, 10 entries", input: "{\"nums\":[63,63,63,63,63,63,63,63,63,63],\"and_values\":[63,63,63,63,63,63,63,63,63,63]}" },
    { label: "Long run: 10 values", input: "{\"nums\":[40,39,26,49,28,11,46,53,16,47],\"and_values\":[2,57,4]}" },
  ],
}

export default function MinSumOfValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence
        label="nums (l to r is the current piece)"
        length={run.input.nums.length}
        active={step.right >= 0 ? step.right : -1}
        valueAt={i => run.input.nums[i]}
        roleAt={i => (i === step.left ? 'l' : i === step.right ? 'r' : step.left >= 0 && i > step.left && i < step.right ? 'window' : '')}
      />
      <output aria-label="Cheapest prefix costs">{`Piece ${step.piece}: ${step.costs.map(v => (v === Infinity ? '-' : v)).join(', ')}`}</output>
    </>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A piece is charged its last element, so a piece that ends at position i pays nums[i - 1] on top of the best cost before it.</p>
  </>} />
}
