import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1932',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with trees: nested {value, left, right} objects or null (at most three nodes each)',
  url: 'https://leetcode.com/problems/merge-bsts-to-create-single-bst/',
  complexity: 'O(k · n) time for k trees with n nodes in total: each attach is a walk through the tree it enters. The visualization caps the input at four trees.',
  examples: [
    { label: 'Chain of three', input: '{"trees":[{"value":7,"left":{"value":2,"left":null,"right":null},"right":{"value":9,"left":null,"right":null}},{"value":2,"left":{"value":1,"left":null,"right":null},"right":null},{"value":9,"left":{"value":8,"left":null,"right":null},"right":{"value":11,"left":null,"right":null}}]}' },
    { label: 'Stuck', input: '{"trees":[{"value":5,"left":{"value":1,"left":null,"right":null},"right":null},{"value":4,"left":null,"right":null}]}' },
    { label: 'Single node', input: '{"trees":[{"value":4,"left":null,"right":null}]}' },
    { label: 'Equal values', input: '{"trees":[{"value":3,"left":{"value":3,"left":null,"right":null},"right":null}]}' },
    { label: 'Long run: four trees of three nodes', input: '{"trees":[{"value":3,"left":{"value":3,"left":null,"right":null},"right":{"value":4,"left":null,"right":null}},{"value":7,"left":{"value":1,"left":null,"right":null},"right":{"value":9,"left":null,"right":null}},{"value":6,"left":{"value":5,"left":null,"right":null},"right":{"value":5,"left":null,"right":null}},{"value":6,"left":{"value":6,"left":null,"right":null},"right":{"value":8,"left":null,"right":null}}]}' },
  ],
}

// Each tree is drawn on its own, so node values are unique inside one diagram.
function toDiagram(node) {
  if (!node) return null
  return { id: node.value, children: [node.left, node.right].filter(Boolean).map(toDiagram) }
}

export default function Problem1932Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <div aria-label="Trees in the pool" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {step.pool.length === 0 && step.merged === null && <em>No trees left in the pool.</em>}
        {step.pool.map((t, i) => <RootedTreeDiagram key={i} root={toDiagram(t)}
          roles={step.focus === t.value ? { [t.value]: 'focus' } : {}} title={`Tree ${i}`} />)}
      </div>
      {step.merged && <RootedTreeDiagram root={toDiagram(step.merged)} roles={{}} title="Merged tree so far" />}
      {step.attached.length > 0 && <p>Attached so far: {step.attached.map(a => `leaf ${a.leaf} ← tree ${a.root}`).join(', ')}</p>}
      {step.result !== undefined && <output aria-label="Result">Result: {step.result ? step.result.join(', ') : 'null'}</output>}
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>A tree joins another only by taking the place of one of its leaves. The finished tree is a valid search tree only when its in-order values strictly increase.</p>
    </>}
  />
}
