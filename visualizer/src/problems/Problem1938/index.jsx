import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1938',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with parents and queries (e.g. {"parents":[-1,0,0,2],"queries":[[3,1],[1,3]]})',
  url: 'https://leetcode.com/problems/maximum-genetic-difference-query/',
  complexity: 'O((n + q) · B) time with a binary trie of B bits (18 for the official value bound). The visualization uses the same trie walk over a short root path.',
  examples: [
    { label: 'Branching tree', input: '{"parents":[-1,0,0,2],"queries":[[3,1],[1,3]]}' },
    { label: 'Chain', input: '{"parents":[-1,0,1,2],"queries":[[3,2],[2,0]]}' },
    { label: 'Single node', input: '{"parents":[-1],"queries":[[0,5]]}' },
    { label: 'Two children of the root', input: '{"parents":[-1,0,0],"queries":[[1,0],[2,0]]}' },
    { label: 'Long run: eight nodes', input: '{"parents":[-1,0,0,0,2,4,0,2],"queries":[[2,27],[0,17],[6,55],[4,13],[2,19],[0,9],[6,47],[4,5]]}' },
  ],
}

export default function Problem1938Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <p>Parent array: <code>{JSON.stringify(run.input.parents)}</code></p>
      <div aria-label="Root path in the trie" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>Values on the path (root first):</strong>
        {step.path.length === 0 && <em>empty</em>}
        {step.path.map((v, i) => <span key={i} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: v === step.node ? 'var(--primary)' : 'var(--surface2)', fontFamily: 'monospace' }}>{v} = {v.toString(2).padStart(4, '0')}</span>)}
      </div>
      {step.query && <p>Query {step.query[0]} asks for value {step.query[1]} ({step.query[1].toString(2).padStart(4, '0')}). Best XOR: <strong>{step.pick}</strong></p>}
      <table aria-label="Answers so far" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Query</th><th>Answer</th></tr></thead>
        <tbody>{run.input.queries.map((q, i) => <tr key={i}><td>{i}: node {q[0]}, value {q[1]}</td><td>{step.answers[i] ?? '·'}</td></tr>)}</tbody>
      </table>
      {step.result !== undefined && <output aria-label="Answers">Answers: {step.result.join(', ')}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
