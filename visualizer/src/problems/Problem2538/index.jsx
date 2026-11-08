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
    { label: 'Path with varied prices', input: '{"n":5,"edges":[[0,2],[2,4],[4,1],[1,3]],"price":[9,4,12,7,20]}' },
    { label: 'Star around node 0', input: '{"n":4,"edges":[[0,3],[0,1],[0,2]],"price":[6,50,2,2]}' },
    { label: 'Single node', input: '{"n":1,"edges":[],"price":[7]}' },
    { label: 'Equal prices', input: '{"n":3,"edges":[[0,1],[0,2]],"price":[4,4,4]}' },
    { label: 'Path of 15 with largest prices', input: '{"n":15,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14]],"price":[100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000]}' },
    { label: 'Long run: random tree of 15 nodes', input: '{"n":15,"edges":[[0,1],[1,2],[2,3],[2,4],[1,5],[3,6],[5,7],[4,8],[0,9],[5,10],[3,11],[6,12],[10,13],[2,14]],"price":[25863,61762,62923,76771,93538,25470,1385,42850,26969,35754,34665,48575,8968,61108,47014]}' },
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
