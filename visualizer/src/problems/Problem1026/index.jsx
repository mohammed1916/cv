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
    { label: 'Own case 1', input: '[9,4,11,2,7,null,15,null,null,5,8,14]' },
    { label: 'Own case 2', input: '[2,null,3,null,1,4]' },
    { label: 'Single node', input: '[5]' },
    { label: 'Repeated values', input: '[5,5,5,5,5]' },
    { label: 'Extremes at the limit', input: '[99,0,99,0,99,0,99,0,99,0,99,0,99,0,99]' },
    { label: 'Long run: 15 nodes', input: '[67,22,92,26,25,23,22,3,42,54,70,24,9,94,45]' },
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
