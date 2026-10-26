import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Build the BST from its level-order array.' },
    { id: 'descend', label: 'Descend', description: 'Go left before handling a node.' },
    { id: 'visit', label: 'In-order visit', description: 'Compare the node with the previously visited value.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest gap.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Level-order tree (JSON, null for gaps, up to 63 slots)',
  url: 'https://leetcode.com/problems/minimum-distance-between-bst-nodes/',
  complexity: 'O(n) time and O(h) recursion space for a tree of height h.',
  examples: [
    { label: '[4,2,6,1,3] -> 1', input: '[4,2,6,1,3]' },
    { label: '[1,0,48,null,null,12,49] -> 1', input: '[1,0,48,null,null,12,49]' },
    { label: 'Skewed', input: '[10,null,20,null,25]' },
  ],
}
export default function MinimumDistanceBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.visited.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Binary search tree" root={run.root} roles={roles} />
      <IndexedSequence label="Values in in-order sequence so far" length={Math.max(step.order.length, 1)} active={step.order.length - 1} valueAt={i => (step.order.length ? step.order[i] : '-')} />
      <output aria-label="Tracking state">prev: {step.prev === null ? 'none' : step.prev} | best: {step.best === null ? 'none' : step.best}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy fact:</strong> in a sorted list the closest pair is always adjacent, because any non-adjacent pair has a value between them that splits their gap.</p>
  </>} />
}
