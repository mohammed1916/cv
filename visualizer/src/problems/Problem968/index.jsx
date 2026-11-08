import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const LABEL = { 0: 'needs watching', 1: 'camera', 2: 'watched' }

const definition = {
  phases: [
    { id: 'start', label: 'Leaves first', description: 'Decide each node after its children.' },
    { id: 'visit', label: 'Decide a node', description: 'Camera if a child needs one; otherwise wait for the parent.' },
    { id: 'root', label: 'Root', description: 'A root that is still unwatched gets a camera.' },
    { id: 'done', label: 'Complete', description: 'Report the number of cameras.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON level order)',
  url: 'https://leetcode.com/problems/binary-tree-cameras/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Seven-node tree', input: '[1,2,3,4,null,null,5]' },
    { label: 'Left-leaning chain', input: '[2,1,null,3]' },
    { label: 'Single root', input: '[0]' },
    { label: 'Equal values', input: '[0,0,0]' },
    { label: 'Null gaps', input: '[1,null,1,null,null,null,1]' },
    { label: 'Long run: 15 entries', input: '[0,8,8,7,1,null,null,9,5,4,4,3,7,6,0]' },
  ],
}

export default function BinaryTreeCameras() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    for (const [id, state] of Object.entries(step.states)) {
      roles[id] = state === 1 ? 'active' : state === 2 ? 'visited' : ''
      tags[id] = LABEL[state]
    }
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={tags} note={`cameras: ${step.cameras}`} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Work bottom-up. A node with an unwatched child must get a camera, since only the node itself can watch that child from below. A node watched by a child needs no camera, and it leaves the decision to its parent otherwise.</p>
    <p>Greedy placement at the lowest possible point is optimal, which is why the cameras are placed as late as possible in the walk.</p>
  </>} />
}
