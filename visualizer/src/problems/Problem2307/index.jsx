import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2307',
  phases: [
    { id: 'setup', label: 'Start', description: 'Nothing is known yet.' },
    { id: 'join', label: 'Join', description: 'Connect two groups using a new equation.' },
    { id: 'check', label: 'Check', description: 'Both names are already connected, so the equation must agree.' },
    { id: 'done', label: 'Result', description: 'Report whether any equation disagrees.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"equations": [["a","b"],["b","c"],["a","c"]], "values": [2, 3, 6]}',
  url: 'https://leetcode.com/problems/check-for-contradictions-in-equations/',
  complexity: 'O(E * alpha(V)) time with union-find and path compression, where E is the number of equations and V the number of names.',
  examples: [
    { label: 'Consistent', input: '{"equations":[["a","b"],["b","c"],["a","c"]],"values":[2,3,6]}' },
    { label: 'Contradiction', input: '{"equations":[["a","b"],["b","c"],["a","c"]],"values":[2,3,5]}' },
    { label: 'Self', input: '{"equations":[["x","x"]],"values":[2]}' },
  ],
}

export default function ContradictionsInEquations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Groups of names">
      <thead><tr><th scope="col">Name</th><th scope="col">Points to</th><th scope="col">Value relative to it</th></tr></thead>
      <tbody>{step.rows.map(row => <tr key={row.name} data-contradiction={step.contradiction ? 'true' : undefined}>
        <td>{row.name}</td><td>{row.parent}</td><td>{row.parent === row.name ? 'root' : Number(row.ratio).toFixed(3)}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Status">{step.contradiction ? 'contradiction' : 'consistent so far'}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each equation gives a ratio between two names. Keep the names in groups, and store each name's ratio to its group's root.</p>
    <p>When two names are already in one group, their ratio is known, and the new equation must match it within a small tolerance. Otherwise the two groups join.</p>
  </>} />
}
