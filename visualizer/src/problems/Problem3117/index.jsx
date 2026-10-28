import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the cost of an empty prefix.' },
    { id: 'piece', label: 'Piece', description: 'Find the cheapest prefixes that end a piece with the required AND.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest split of the whole array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and targets (JSON object with nums and and_values)',
  url: 'https://leetcode.com/problems/minimum-sum-of-values-by-dividing-array/',
  complexity: 'O(m * n^2) time and O(n) space in this trace. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4,3,3,2],"and_values":[0,3,3,2]}' },
    { label: 'Example 2', input: '{"nums":[2,3,5,7,7,7,5],"and_values":[0,7,5]}' },
  ],
}

export default function MinSumOfValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <output aria-label="Cheapest prefix costs">{`Piece ${step.piece}: ${step.costs.map(v => (v === Infinity ? '-' : v)).join(', ')}`}</output>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A piece is charged its last element, so a piece that ends at position i pays nums[i - 1] on top of the best cost before it.</p>
  </>} />
}
