import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1993',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Parent array and operations (JSON)',
  url: 'https://leetcode.com/problems/operations-on-tree/',
  complexity: 'O(n) per operation for the ancestor and descendant walks in this visual.',
  examples: [
    { label: 'Lock and upgrade', input: '{"parent":[-1,0,0,2,2,3],"operations":[["lock",3,4],["upgrade",2,5],["unlock",3,4],["upgrade",0,1]]}' },
    { label: 'Chain', input: '{"parent":[-1,0,1],"operations":[["lock",2,5],["upgrade",1,6]]}' },
  ],
}

function renderNode(v, children, owner, key) {
  return <li key={key} style={{ color: 'var(--text)' }}>
    <span style={{ fontFamily: 'monospace' }}>node {v}</span>
    {owner[v] !== null && <span style={{ marginLeft: 8, border: '1px solid var(--primary)', borderRadius: 4, padding: '0 6px' }}>locked by {owner[v]}</span>}
    {children[v].length > 0 && <ul style={{ listStyle: 'none', paddingLeft: 20, margin: 0 }}>
      {children[v].map(c => renderNode(c, children, owner, c))}
    </ul>}
  </li>
}

export default function OperationsOnTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { parent, owner, index, ok, results, operations } = step.snapshot
    const children = parent.map(() => [])
    parent.forEach((p, i) => { if (p !== -1) children[p].push(i) })
    return <>
      <ul aria-label="Tree with lock owners" style={{ listStyle: 'none', paddingLeft: 0 }}>
        {renderNode(0, children, owner, 0)}
      </ul>
      {index >= 0 && <p>Operation {index + 1} <strong>{operations[index].join(' ')}</strong>: {ok ? 'accepted' : 'rejected'}.</p>}
      <p>Results so far: <strong>{results.length ? results.map(r => (r ? 'true' : 'false')).join(', ') : 'none'}</strong></p>
    </>
  }} renderReasoning={() => <p>A lock is local to one node. An upgrade is the only operation that touches descendants: it needs a locked descendant and no locked ancestor, then it releases those descendants and locks the node.</p>} />
}
