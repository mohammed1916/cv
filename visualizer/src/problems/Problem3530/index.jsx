import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No node is placed; the profit is 0.' },
    { id: 'extend', label: 'Extend', description: 'Place a node whose predecessors are all placed.' },
    { id: 'done', label: 'Complete', description: 'Report the best profit over all nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges and score, for example {"n":3,"edges":[[0,1],[0,2]],"score":[1,6,3]}',
  url: 'https://leetcode.com/problems/maximum-profit-from-valid-topological-order-in-dag/',
  complexity: 'O(2^n * n) time and O(2^n) space. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"edges":[[0,1]],"score":[2,3]}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1],[0,2]],"score":[1,6,3]}' },
  ],
}

export default function TopologicalProfit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Placed set">{`Placed set (bitmask ${step.mask.toString(2).padStart(run.input.n, '0')}): ${[...Array(run.input.n).keys()].filter(v => step.mask & (1 << v)).join(', ') || 'none'}`}</output>
    <output aria-label="Profit">{`Best profit for this set: ${step.value}${step.node >= 0 ? `, last placed node ${step.node}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A node placed at position p earns score times p, so the order matters. Positions are assigned left to right.</p>
    <p>A set of placed nodes fixes the next position, so the best profit for each set can be built from smaller sets with one node added.</p>
  </>} />
}
