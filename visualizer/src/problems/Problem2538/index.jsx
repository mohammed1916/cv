import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No root has been tried yet.' },
    { id: 'root', label: 'Root', description: 'Walk all paths from this root and measure the spread of their price sums.' },
    { id: 'done', label: 'Complete', description: 'Report the largest cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with n, edges and price, for example {"n": 3, "edges": [[0,1],[1,2]], "price": [1,1,1]}',
  url: 'https://leetcode.com/problems/difference-between-maximum-and-minimum-price-sum/',
  complexity: 'O(n^2) in this walk-through, one walk per root. The visualization caps n at 15.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"edges":[[0,1],[1,2],[1,3],[3,4],[3,5]],"price":[9,8,7,6,10,5]}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1],[1,2]],"price":[1,1,1]}' },
  ],
}

export default function PriceSumSpread() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node prices" length={run.input.n} valueAt={index => run.input.price[index]} active={step.root} />
    <output aria-label="Root cost">{step.root >= 0 ? `Root ${step.root}: cost ${step.cost}. Best so far ${step.best}.` : `Best so far ${step.best}.`}</output>
  </>} renderReasoning={() => <>
    <p>The cost of a root is the heaviest path sum from it minus the lightest one.</p>
    <p>Prices are positive, so the lightest path from a root is the root alone; the walk still measures the true minimum.</p>
  </>} />
}
