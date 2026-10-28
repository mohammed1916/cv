import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Compare how often each cost appears in the two baskets.' },
    { id: 'swap', label: 'Route', description: 'Each surplus fruit is moved at the cheaper of its own cost or twice the cheapest fruit.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum cost, or -1 if the baskets cannot match.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with basket1 and basket2 (equal-length arrays, 1 to 4 entries, costs 1 to 5)',
  url: 'https://leetcode.com/problems/rearranging-fruits/',
  complexity: 'O(n log n) time for the sort of the surplus costs. The visualization caps input at 4 fruits per basket.',
  examples: [
    { label: 'Example 1', input: '{"basket1":[4,2,2,2],"basket2":[1,4,1,2]}' },
    { label: 'Example 2', input: '{"basket1":[2,3,4,1],"basket2":[3,2,5,1]}' },
  ],
}

export default function RearrangingFruits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Basket 1 (left) and basket 2 (right) fruit costs" length={run.input.basket1.length} valueAt={i => `${run.input.basket1[i]} / ${run.input.basket2[i]}`} active={-1} roleAt={() => ''} />
    <output aria-label="Cost so far">{`Cost so far: ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>After the counts balance, the surplus fruits must be swapped pairwise. A swap costs the smaller of the two fruits, or the cheapest fruit overall used twice as a relay.</p>
    <p>Sorting the surplus and taking the cheaper route for the smaller half gives the minimum cost.</p>
  </>} />
}
