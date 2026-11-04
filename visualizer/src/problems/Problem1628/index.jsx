import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1628',
  phases: [
    { id: 'start', label: 'Empty', description: 'No subtrees yet.' },
    { id: 'leaf', label: 'Leaf', description: 'A number becomes a leaf on the stack.' },
    { id: 'combine', label: 'Combine', description: 'An operator joins the two top subtrees.' },
    { id: 'done', label: 'Result', description: 'The single remaining tree gives the value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with postfix: a list of digits and operators + - * /',
  url: 'https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/',
  complexity: 'O(n) for n tokens. Each operator combines the two newest subtrees, so the stack never grows past the number of leaves.',
  examples: [
    { label: 'Example', input: '{"postfix":["6","3","+","5","*","4","-"]}' },
    { label: 'Division', input: '{"postfix":["9","2","/","1","+"]}' },
  ],
}

// One node: the operator or digit, with its children drawn beneath it.
function TreeNode({ node, depth = 0 }) {
  const leaf = node.children.length === 0
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ minWidth: 34, padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace', borderRadius: 6, color: 'var(--text)',
      border: '1px solid var(--border)', background: leaf ? 'var(--surface2)' : 'color-mix(in srgb, var(--primary) 18%, transparent)' }}>
      {node.label}{!leaf && <small style={{ color: 'var(--text-muted)' }}> = {node.value}</small>}
    </div>
    {!leaf && <div style={{ display: 'flex', gap: 12, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
      {node.children.map((child, index) => <TreeNode key={index} node={child} depth={depth + 1} />)}
    </div>}
  </div>
}

export default function DesignAnExpressionTreeWithEvaluateFunction() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Subtrees on the stack">
      <h3 style={{ color: 'var(--text)' }}>Subtrees waiting on the stack</h3>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {step.trees.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Empty.</p>}
        {step.trees.map((node, index) => <TreeNode key={index} node={node} />)}
      </div>
    </section>
    <output aria-label="Current step" style={{ display: 'block', marginTop: 10, color: 'var(--text)' }}>{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each operator's two operands are the two most recent subtrees, which is why a stack builds the tree bottom up.</p>
    <p>Evaluating while combining gives the same value as evaluating the finished tree, and it needs no extra pass.</p>
  </>} />
}
