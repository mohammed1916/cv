import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CooldownTreeView from './CooldownTreeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges, nums and k',
  url: 'https://leetcode.com/problems/subtree-inversion-sum-ii/',
  complexity: 'O(n · k) time and space, since each node keeps two rows of k + 1 entries and each merge scans one row. Officially n reaches 50000 and k reaches 50; the visualization caps n at 14.',
  examples: [
    { label: 'Siblings fit', input: '{"edges":[[0,1],[0,2],[1,3],[1,4]],"nums":[2,-7,-4,3,-6],"k":3}' },
    { label: 'Nested flips', input: '{"edges":[[0,1],[1,2],[2,3]],"nums":[-3,1,-1,-8],"k":2}' },
    { label: 'Too close for two', input: '{"edges":[[0,1],[1,2],[1,3]],"nums":[4,2,-9,-2],"k":5}' },
  ],
}

export default function SubtreeInversionSumII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CooldownTreeView run={run} step={step} />} renderReasoning={() => <>
    <p>Inversions cancel in pairs, so a node's sign depends only on whether an odd or even number of inverted nodes sit on its path from the root. Each subtree therefore needs an answer for both cases.</p>
    <p>The rule covers every pair, including nodes in different branches. Two branches meet at their lowest common node, and the closest pair across them is formed by each branch's nearest inverted node. So the table records that nearest distance, and only those two distances need checking at a merge.</p>
    <p>Inverting a node puts the nearest inverted node at distance 0, so everything below it must be at least k away. Any distance from k upward can never cause a conflict, so those share one column.</p>
  </>} />
}
