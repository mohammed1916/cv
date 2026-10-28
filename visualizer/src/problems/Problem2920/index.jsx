import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start at the root with no halvings above it.' },
    { id: 'keep', label: 'Keep', description: 'Take coins minus k; the subtree is not halved.' },
    { id: 'halve', label: 'Halve', description: 'Take half the coins; every node below has its coins halved.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with n, edges, coins and k, for example {"n": 4, "edges": [[0,1],[1,2],[2,3]], "coins": [10,10,3,3], "k": 5}',
  url: 'https://leetcode.com/problems/maximum-points-after-collecting-coins-from-all-nodes/',
  complexity: 'O(n * log C) states for coins up to C. The visualization caps n at 15.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]],"coins":[10,10,3,3],"k":5}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1],[0,2]],"coins":[8,4,4],"k":0}' },
  ],
}

export default function CoinHalving() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Coins" length={run.input.n} valueAt={index => run.input.coins[index]} active={step.node} roleAt={index => (index === step.node ? step.phase : '')} />
    <output aria-label="Halvings above node">{step.node >= 0 ? `Node ${step.node}: ${step.halvings} halvings above it, subtree best ${step.total}` : `Total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Choosing the second way for a node halves its own coins and every coin count below it, so the tree DP tracks how many halvings sit above each node.</p>
    <p>Coin counts reach zero after about log2(max coins) halvings, so the state space stays small.</p>
  </>} />
}
