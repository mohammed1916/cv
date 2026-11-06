import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1409',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Permutation size and queries (JSON object)',
  url: 'https://leetcode.com/problems/queries-on-a-permutation-with-key/',
  complexity: 'O(m * q) time for q queries over m values, because each query searches and reshuffles the list.',
  examples: [
    { label: 'Move-to-front', input: '{"m":5,"queries":[3,1,2,1]}' },
    { label: 'Repeat one', input: '{"m":4,"queries":[4,4,4]}' },
    { label: 'Single item', input: '{"m":1,"queries":[1]}' },
  ],
}

const tile = { minWidth: 44, padding: 12, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', background: 'var(--surface2)' }

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { perm, query, position } = step.snapshot
    const upto = run.frames.indexOf(step)
    const answers = []
    for (let k = 0; k <= upto; k++) {
      const f = run.frames[k]
      if (f.phase === 'inspect') answers.push({ query: f.snapshot.query, position: f.snapshot.position })
    }
    return <>
      <p style={{ color: 'var(--text)' }}>{query === null ? 'Each query is looked up, its position is recorded, then the value moves to the front.' : `Looking up ${query}, found at position ${position}. It will move to the front next.`}</p>
      <div role="img" aria-label="Current permutation" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {perm.map((v, i) => <div key={v} style={{ ...tile, borderWidth: v === query ? 2 : 1, borderColor: v === query ? 'var(--primary)' : 'var(--border)', fontWeight: v === query ? 700 : 400 }}>
          <div>{v}</div><small>pos {i}</small>
        </div>)}
      </div>
      <table aria-label="Answers so far" style={{ borderCollapse: 'collapse', color: 'var(--text)', fontSize: 14 }}>
        <thead><tr><th style={tile}>query</th><th style={tile}>position</th></tr></thead>
        <tbody>{answers.length ? answers.map((a, i) => <tr key={i}><td style={tile}>{a.query}</td><td style={tile}>{a.position}</td></tr>)
          : <tr><td style={tile} colSpan={2}>No queries yet</td></tr>}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Positions are read before the move.</strong> Each answer is the zero-based index of the value at the moment its query arrives.</p>
    <p><strong>Moves change later answers.</strong> Moving a value to the front pushes earlier entries one slot right, so later lookups see the shifted list.</p>
  </>} />
}
