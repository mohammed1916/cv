import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'total', label: 'Total', description: 'Add up every node value.' },
    { id: 'measure', label: 'Subtree sums', description: 'Compute each subtree sum from the leaves upward.' },
    { id: 'cut', label: 'Cut edge', description: 'Cutting above a subtree gives the two parts; compare their product.' },
    { id: 'done', label: 'Complete', description: 'Report the best product modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order binary tree of values 1 to 20 (JSON object with tree)',
  url: 'https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,2,3,4,5,6]}' },
    { label: 'Example 2', input: '{"tree":[1,null,2,3,4,null,null,5,6]}' },
  ],
}

export default function MaximumProductSplittedTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'active'
    const tags = {}
    Object.entries(step.sums).forEach(([id, value]) => { tags[id] = `sum ${value}` })
    return <>
      <BinaryTreeLane title="Tree (subtree sums)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Best product">{`Total ${step.total}. Best product so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Cutting the edge above a subtree with sum s splits the tree into s and total minus s, so the best cut is the subtree whose sum is closest to half the total.</p>
    <p>All subtree sums come from one bottom-up pass, and the product is reduced modulo 1000000007 only at the end.</p>
  </>} />
}
