import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the root with no ancestors.' },
    { id: 'visit', label: 'Root', description: 'The root starts the ancestor range.' },
    { id: 'compare', label: 'Compare', description: 'Compare this node with the ancestor range.' },
    { id: 'done', label: 'Complete', description: 'Report the largest difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree values 0-99 (JSON level order)',
  url: 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/',
  complexity: 'O(n) time and O(h) space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '[8,3,10,1,6,null,14,null,null,4,7,13]' },
    { label: 'Example 2', input: '[1,null,2,null,0,3]' },
  ],
}

export default function MaxAncestorDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Best">{`Largest difference so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The largest gap between a node and an ancestor is achieved against the smallest or largest ancestor value on its path.</p>
    <p>Passing that range down the tree means each node is compared in constant time.</p>
  </>} />
}
