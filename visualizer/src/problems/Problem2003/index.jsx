import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2003',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Parents and distinct genetic values (JSON)',
  url: 'https://leetcode.com/problems/smallest-missing-genetic-value-in-each-subtree/',
  complexity: 'O(n * d) time here, where d is the depth of the node holding 1; the subtree walk is repeated along that path.',
  examples: [
    { label: 'Chain', input: '{"parents":[-1,0,1],"nums":[3,1,2]}' },
    { label: 'Branches', input: '{"parents":[-1,0,0,1],"nums":[2,1,4,3]}' },
    { label: 'No one', input: '{"parents":[-1,0],"nums":[2,3]}' },
  ],
}

function Tree({ node, parents, nums, ans, climbing }) {
  const kids = parents.map((p, i) => (p === node ? i : -1)).filter(i => i >= 0)
  return <li style={{ color: 'var(--text)' }}>
    <span style={{
      fontFamily: 'monospace', border: `${climbing === node ? 2 : 1}px solid ${climbing === node ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 4, padding: '0 6px',
    }}>node {node} · value {nums[node]} · answer {ans[node]}</span>
    {kids.length > 0 && <ul style={{ listStyle: 'none', paddingLeft: 20 }}>
      {kids.map(k => <Tree key={k} node={k} parents={parents} nums={nums} ans={ans} climbing={climbing} />)}
    </ul>}
  </li>
}

export default function SmallestMissingGeneticValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { parents, nums, node, ans, path } = step.snapshot
    return <>
      <ul aria-label="Family tree with answers" style={{ listStyle: 'none', paddingLeft: 0 }}>
        <Tree node={0} parents={parents} nums={nums} ans={ans} climbing={node} />
      </ul>
      <p>Path from the node holding 1 to the root: <strong>{path.length ? path.join(' → ') : '-'}</strong>. Nodes off this path keep answer 1.</p>
    </>
  }} renderReasoning={() => <p>Only ancestors of the node with value 1 can have a subtree that misses 1, so only those nodes need their subtree collected and checked.</p>} />
}
