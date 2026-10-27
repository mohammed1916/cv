import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the breadth-first walk at the root.' },
    { id: 'visit', label: 'Dequeue', description: 'Take the next node with its depth and parent.' },
    { id: 'found', label: 'Record', description: 'Store the depth and parent of a target value.' },
    { id: 'done', label: 'Decide', description: 'Compare depths and parents once both values are recorded.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Tree (JSON level order) with x and y: {"arr": [...], "x": n, "y": n}',
  url: 'https://leetcode.com/problems/cousins-in-binary-tree/',
  complexity: 'O(n) time and O(n) space for the walk. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"arr":[1,2,3,4],"x":4,"y":3}' },
    { label: 'Example 2', input: '{"arr":[1,2,3,null,4,null,5],"x":5,"y":4}' },
  ],
}

export default function CousinsInBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    for (const [id, depth] of Object.entries(step.depths)) tags[id] = `depth ${depth}`
    for (const entry of step.found.values()) roles[entry.id] = 'match'
    if (step.node !== null) roles[step.node] = 'active'
    const entries = [...step.found.entries()].map(([value, info]) => `${value}: depth ${info.depth}, parent ${info.parent ?? 'none'}`)
    return <>
      <BinaryTreeLane title="Tree (values)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Recorded values">{entries.length ? `Recorded ${entries.join('; ')}` : 'No target recorded yet.'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Cousins sit at the same depth, so a breadth-first walk reaches both values level by level with their depth known.</p>
    <p>Being at the same depth is not enough: siblings share a parent, so the parents must differ as well.</p>
  </>} />
}
