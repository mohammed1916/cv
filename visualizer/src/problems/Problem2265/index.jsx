import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a count of zero.' },
    { id: 'subtree', label: 'Subtree', description: 'Combine the sums and sizes of the children, then compare the floored average.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a level-order tree, for example {"tree":[4,8,5,0,1]}',
  url: 'https://leetcode.com/problems/count-nodes-equal-to-average-of-subtree/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Own: lopsided tree', input: '{"tree":[9,3,null,7,2]}' },
    { label: 'Single node', input: '{"tree":[1]}' },
    { label: 'Root with one child', input: '{"tree":[3,1]}' },
    { label: 'Equal values in full tree', input: '{"tree":[5,5,5,5,5,5,5]}' },
    { label: 'Full tree of 15 nodes', input: '{"tree":[50,0,50,0,50,0,50,0,50,0,50,0,50,0,50]}' },
    { label: 'Long run: 15 entries', input: '{"tree":[48,25,42,24,2,22,22,13,22,38,22,28,2,18,30]}' },
  ],
}

export default function SubtreeAverage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    Object.entries(step.marks).forEach(([id, label]) => { roles[id] = label.startsWith('match') ? 'match' : 'visited' })
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={step.marks} />
      <output aria-label="Count">{`Matching nodes: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A subtree's sum and size are built from its children, so the average of every subtree is known when its root is reached, without visiting any subtree twice.</p>
    <p>The average is rounded down, so the comparison uses integer division.</p>
  </>} />
}
