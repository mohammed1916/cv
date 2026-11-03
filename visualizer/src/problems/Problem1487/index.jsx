import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1487',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a names list (JSON)',
  url: 'https://leetcode.com/problems/making-file-names-unique/',
  complexity: 'About O(n) expected time with hash sets and maps, plus the length of any suffix search for repeated names.',
  examples: [
    { label: 'Repeated doc', input: '{"names":["doc","doc","doc","doc"]}' },
    { label: 'Mixed names', input: '{"names":["notes","todo","notes","notes","todo"]}' },
    { label: 'All distinct', input: '{"names":["one","two","three"]}' },
  ],
}

export default function UniqueFileNames() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { names } = run.input
    const { index, candidate, used, result } = step.snapshot
    const current = index ?? -1
    return <>
      <div role="img" aria-label="Requested names" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {names.map((name, i) => <div key={i} data-index={i} style={{
          padding: '6px 8px', fontFamily: 'monospace', color: '#1c1917', background: i < result.length ? '#bbf7d0' : '#e7e5e4',
          border: `${i === current ? 2 : 1}px solid ${i === current ? 'var(--text)' : 'var(--border)'}`, opacity: i > current ? 0.55 : 1,
        }}>{name}</div>)}
      </div>
      <p>{candidate ? `Candidate name: ${candidate}` : 'No candidate chosen yet.'}</p>
      <table aria-label="Assigned names" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>request</th><th>assigned</th></tr></thead>
        <tbody>{result.length === 0 ? <tr><td colSpan={2}>none yet</td></tr> : result.map((assigned, i) => <tr key={i}><td>{names[i]}</td><td>{assigned}</td></tr>)}</tbody>
      </table>
      <p>Reserved names: {used.length ? used.join(', ') : 'none'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Reserve as you go:</strong> a name is kept only if it is still free when its request arrives, so the answer is built in request order.</p>
    <p><strong>Resume counters:</strong> remembering the next suffix per base name skips suffixes that are already known to be taken.</p>
  </>} />
}
