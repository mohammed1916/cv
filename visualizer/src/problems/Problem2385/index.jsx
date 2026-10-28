import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Infect the start node at minute 0.' },
    { id: 'spread', label: 'Spread', description: 'Infect every uninfected neighbor one minute later.' },
    { id: 'done', label: 'Complete', description: 'Report the last minute that infected a node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level order) and start value (JSON)',
  url: 'https://leetcode.com/problems/amount-of-time-for-binary-tree-to-be-infected/',
  complexity: 'O(n) time and O(n) space for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[1,5,3,null,4,10,6,9,2],"start":3}' },
    { label: 'Chain', input: '{"root":[1,2,null,3,null,4,null,5],"start":3}' },
  ],
}

export default function InfectBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    for (const [id, minute] of Object.entries(step.infected)) {
      roles[id] = 'visited'
      tags[id] = `t${minute}`
    }
    for (const id of step.newly) roles[id] = 'active'
    return <>
      <BinaryTreeLane title="Tree (infection minute)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Minute">{`Minute ${step.minute ?? 0}: ${Object.keys(step.infected).length} infected`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Infection moves along parent and child links, so the tree is treated as an undirected graph.</p>
    <p>Breadth-first search from the start visits nodes in order of their distance, which is the minute they are infected.</p>
  </>} />
}
