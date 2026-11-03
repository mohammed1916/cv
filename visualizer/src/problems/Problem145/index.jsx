import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '145',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree as level-order list (JSON, null for empty)',
  url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/',
  complexity: 'O(n) time and O(n) stack space for n nodes. Each node is pushed twice: once to expand, once to emit.',
  examples: [
    { label: 'Balanced', input: '[5,3,8,null,4,7,9]' },
    { label: 'Left heavy', input: '[4,2,null,1,3]' },
    { label: 'Single node', input: '[1]' },
  ],
}

export default function BinaryTreePostorderTraversal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { stack, output, current } = step.snapshot
    return <>
      <p>Stack (top on the right)</p>
      <div role="list" aria-label="Stack" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 40 }}>
        {stack.length === 0 && <span>empty</span>}
        {stack.map((e, i) => <span key={i} role="listitem" style={{ border: `1px solid ${i === stack.length - 1 ? 'var(--text)' : 'var(--border)'}`, padding: '4px 8px', fontFamily: 'monospace' }}>
          {e === null ? 'null' : `${e.value}${e.finished ? ' ✓' : ''}`}
        </span>)}
      </div>
      <p>Output so far: {output.length ? output.join(', ') : 'nothing yet'}{current !== null && current !== undefined ? ` · current ${current}` : ''}</p>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Postorder:</strong> left subtree, right subtree, then the node. A node is marked finished on the stack before its children are handled, so it is emitted last.</p>
    <p>{step.snapshot.output.length === 0 ? 'Nothing is emitted until the first node finishes.' : 'Emitted values are listed in the order they were completed.'}</p>
  </>} />
}
