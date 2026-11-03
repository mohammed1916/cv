import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '144',
  inputLabel: 'Tree in level order as a JSON array (null = no child)',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Balanced', input: '[5,3,8,1,4,null,9]' },
    { label: 'Right lean', input: '[1,null,2,null,3]' },
    { label: 'Sparse', input: '[9,null,4,2,null,8,null,null,6]' },
  ],
  complexity: 'Time O(n) · Space O(h) for the explicit stack, where h is the tree height.',
  url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
}

const box = {
  display: 'inline-block', minWidth: 34, margin: 2, padding: '4px 8px', borderRadius: 6,
  border: '1px solid currentColor', textAlign: 'center',
}

function PreorderVisual({ step }) {
  const { stack, output, current, pushed } = step.snapshot
  return <div style={{ padding: 8 }}>
    <h4>Stack (top on the right)</h4>
    <div>{stack.length ? stack.map((v, i) => <span key={i} style={{ ...box, background: pushed?.includes(v) ? 'rgba(8,145,178,0.25)' : 'transparent' }}>{v}</span>)
      : <em>empty</em>}</div>
    <h4>Recorded in preorder</h4>
    <div>{output.length ? output.map((v, i) => <span key={i} style={{ ...box, background: i === output.length - 1 && current !== null ? 'rgba(8,145,178,0.25)' : 'transparent' }}>{v}</span>)
      : <em>nothing yet</em>}</div>
    {current !== null && <p>Current node: {current}</p>}
  </div>
}

export default function BinaryTreePreorderTraversal() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <PreorderVisual step={step} />}
    renderReasoning={() => <p>Preorder records a node before its subtrees. A stack reproduces the recursive order: push right, then left, so left is popped first.</p>} />
}
