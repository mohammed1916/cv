import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start at the root with no value above it.' },
    { id: 'visit', label: 'Visit', description: 'This node is below the largest value on its path.' },
    { id: 'good', label: 'Good node', description: 'This node is at least as large as every node above it.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values in level order, null for missing (JSON)',
  url: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/',
  complexity: 'O(n) time and O(h) space for the recursion.',
  examples: [
    { label: 'Example 1', input: '{"values":[3,1,4,3,null,1,5]}' },
    { label: 'Example 2', input: '{"values":[3,3,null,4,2]}' },
  ],
}

export default function GoodNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = step.phase === 'good' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Count">{`Good nodes so far: ${step.count}. Largest above: ${step.best === null ? '-' : step.best === -Infinity ? 'none' : step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A node is good when no ancestor on its path is larger, so the largest value above it is enough to decide.</p>
  </>} />
}
