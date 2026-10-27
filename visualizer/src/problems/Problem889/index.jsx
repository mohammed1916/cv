import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, partialTree, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Index the postorder positions.' },
    { id: 'root', label: 'Create root', description: 'Take the next preorder value as the subtree root.' },
    { id: 'split', label: 'Split subtrees', description: 'Use the left root position in postorder to size the left subtree.' },
    { id: 'done', label: 'Complete', description: 'Return the constructed tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Input {preorder, postorder} (JSON, n ≤ 30)',
  url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/',
  complexity: 'O(n) time and space with a postorder index map (a node with one child is attached as the left child, so any valid tree is accepted).',
  examples: [
    { label: 'Official', input: '{"preorder":[1,2,4,5,3,6,7],"postorder":[4,5,2,6,7,3,1]}' },
    { label: 'Single node', input: '{"preorder":[1],"postorder":[1]}' },
    { label: 'Skewed', input: '{"preorder":[1,2,3],"postorder":[3,2,1]}' },
  ],
}

export default function ConstructFromPreAndPostorder() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { preorder, postorder } = run.input
      const hasRange = step.preLo !== null
      return <>
        <IndexedSequence label="Preorder" length={preorder.length} valueAt={i => preorder[i]} active={hasRange ? step.preLo : -1}
          roleAt={i => (hasRange && i > step.preLo && i <= step.preHi ? 'subtree' : '')} />
        <IndexedSequence label="Postorder" length={postorder.length} valueAt={i => postorder[i]} active={-1}
          roleAt={i => (hasRange && i >= step.postLo && i < step.postLo + (step.preHi - step.preLo + 1) ? 'subtree' : '')} />
        <BinaryTreeLane title="Tree built so far" root={partialTree(run, step.count)} roles={step.active === null ? {} : { [step.active]: 'active' }} />
        {step.phase === 'done' && <output aria-label="Result">Level order: [{run.result.join(', ')}]</output>}
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Why it works:</strong> in preorder the left subtree immediately follows its root; in postorder the left subtree ends at its own root. Locating that root in postorder tells how many nodes the left subtree owns.</p>
    </>} />
}
