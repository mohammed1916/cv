import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root with an empty binary number.' },
    { id: 'visit', label: 'Extend', description: 'Shift the path left and add this node’s bit.' },
    { id: 'leaf', label: 'Leaf', description: 'Add the completed binary number to the total.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root: a 0/1 level-order array (JSON)',
  url: 'https://leetcode.com/problems/sum-of-root-to-leaf-binary-numbers/',
  complexity: 'O(n) time and O(h) stack. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example', input: '{"root":[1,0,1,0,1,0,1]}' },
    { label: 'Missing child', input: '{"root":[1,0,1,null,1]}' },
  ],
}

export default function SumRootToLeaf() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree (bits)" root={run.root} roles={roles} />
      <output aria-label="Binary path">{`Path so far: ${step.path.toString(2)} (${step.path}), total: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each step down shifts the partial number left by one bit and adds the new bit, so every node holds the value of its root path.</p>
    <p>Only leaves contribute, because each root-to-leaf path is a complete binary number.</p>
  </>} />
}
