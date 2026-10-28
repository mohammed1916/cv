import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The root is worth 0.' },
    { id: 'recover', label: 'Recover values', description: 'Each child is worth twice its parent plus one or two.' },
    { id: 'collect', label: 'Collect', description: 'Gather the recovered values.' },
    { id: 'find', label: 'Find targets', description: 'Check each target against the recovered values.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with contaminated tree (level order, all -1) and targets (JSON)',
  url: 'https://leetcode.com/problems/find-elements-in-a-contaminated-binary-tree/',
  complexity: 'O(n) time to recover the values, then O(1) per lookup in a set. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Right child only', input: '{"tree":[-1,null,-1],"targets":[1,2]}' },
    { label: 'Full five', input: '{"tree":[-1,-1,-1,-1,-1],"targets":[1,3,5]}' },
  ],
}

export default function ContaminatedTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = step.node === null ? {} : { [step.node]: 'active' }
    return <>
      <BinaryTreeLane title="Contaminated tree (tags show recovered values)" root={run.root} roles={roles} tags={step.tags} />
      <output aria-label="Current step">{step.target !== undefined ? `Target ${step.target}: ${step.found ? 'found' : 'not found'}.` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every node sits at a fixed position in an infinite binary tree, so its value is a function of its path from the root.</p>
    <p>Recovering all values once turns each lookup into a set membership check.</p>
  </>} />
}
