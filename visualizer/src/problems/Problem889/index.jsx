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
    { label: 'Own case 1', input: '{"preorder":[2,3,5,6,4,7,8],"postorder":[5,6,3,7,8,4,2]}' },
    { label: 'Single node', input: '{"preorder":[1],"postorder":[1]}' },
    { label: 'Skewed', input: '{"preorder":[1,2,3],"postorder":[3,2,1]}' },
    { label: 'Single node 7', input: '{"preorder":[7],"postorder":[7]}' },
    { label: 'Three nodes', input: '{"preorder":[457,377,602],"postorder":[377,602,457]}' },
    { label: 'Extreme values', input: '{"preorder":[1000,1,999],"postorder":[1,999,1000]}' },
    { label: 'Long run: 30 nodes', input: '{"preorder":[175,712,113,201,479,700,186,662,153,801,607,283,790,558,394,336,697,566,323,33,65,396,303,482,631,157,577,996,301,51],"postorder":[700,479,201,113,801,607,153,558,394,790,65,33,323,566,697,631,482,303,396,336,283,662,301,996,577,51,157,186,712,175]}' },
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
