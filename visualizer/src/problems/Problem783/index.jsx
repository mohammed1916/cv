import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import TreeWalkView from '../../components/shared/TreeWalkView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Build the BST from its level-order array.' },
    { id: 'descend', label: 'Descend', description: 'Go left before handling a node.' },
    { id: 'visit', label: 'In-order visit', description: 'Compare the node with the previously visited value.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Level-order tree (JSON, null for gaps, up to 63 slots)',
  url: 'https://leetcode.com/problems/minimum-distance-between-bst-nodes/',
  complexity: 'O(n) time and O(h) recursion space for a tree of height h.',
  examples: [
    { label: '[4,2,6,1,3] -> 1', input: '[4,2,6,1,3]' },
    { label: '[1,0,48,null,null,12,49] -> 1', input: '[1,0,48,null,null,12,49]' },
    { label: 'Skewed', input: '[10,null,20,null,25]' }, { label: 'Two nodes', input: '[1,null,2]' }, { label: 'Equal gaps tie', input: '[2,1,3]' }, { label: 'Widest gap', input: '[0,null,100000]' }, { label: 'Long run: 31 nodes', input: '[49517,21783,83938,6630,36763,75121,91840,5101,7538,29823,45641,63918,78850,90195,94876,4679,6237,6913,18343,26290,36327,45541,46597,58648,63941,75455,82268,84434,91663,91883,95048]' },
  ],
}
export default function MinimumDistanceBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.visited.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Binary search tree" root={run.root} roles={roles} />
      {step.treeWalk && <TreeWalkView {...step.treeWalk} />}
      <output aria-label="Tracking state">prev: {step.prev === null ? 'none' : step.prev} | best: {step.best === null ? 'none' : step.best}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy fact:</strong> in a sorted list the closest pair is always adjacent, because any non-adjacent pair has a value between them that splits their gap.</p>
  </>} />
}
