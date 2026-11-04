import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look for a good subset of the rows, smallest subsets first.' },
    { id: 'check', label: 'Check subset', description: 'Add up each column for this subset and compare with floor(k / 2).' },
    { id: 'good', label: 'Good', description: 'Every column sum is within the limit.' },
    { id: 'done', label: 'Complete', description: 'Report the rows found, or an empty list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (up to 6 rows of 0 and 1, up to 5 columns)',
  url: 'https://leetcode.com/problems/find-a-good-subset-of-the-matrix/',
  complexity: 'Exhaustive over subsets of rows: at most 2^6 subsets of up to 6 rows and 5 columns for the visualization cap.',
  examples: [
    { label: 'Pair of rows', input: '{"grid": [[1,0,1],[0,1,0],[1,1,0]]}' },
    { label: 'No good subset', input: '{"grid": [[1,1,1],[1,1,1],[1,1,0]]}' },
  ],
}

const cell = (on, chosen) => ({
  width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 4,
  border: '1px solid var(--border)', color: 'var(--text)',
  background: chosen && on ? 'var(--primary)' : on ? 'var(--primary-glow)' : 'var(--surface)',
})

export default function GoodSubset() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const chosen = new Set(step.rows)
    return <section aria-label="Matrix rows" style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        {run.grid.map((row, i) => <div key={i} data-chosen={chosen.has(i) ? 'yes' : 'no'} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 56, color: chosen.has(i) ? 'var(--primary)' : 'var(--text-muted)' }}>{`Row ${i}`}</span>
          {row.map((v, c) => <div key={c} style={cell(v === 1, chosen.has(i))}>{v}</div>)}
        </div>)}
      </div>
      {step.sums && <p style={{ margin: 0, color: 'var(--text)' }}>Column sums: <code>[{step.sums.join(', ')}]</code>, limit <code>{step.limit}</code> for {step.rows.length} rows.</p>}
      <p style={{ margin: 0, color: 'var(--text)' }}>{step.message}</p>
    </section>
  }} renderReasoning={() => <>
    <p>A subset of k rows is good when no column has more than floor(k / 2) ones among those rows.</p>
    <p>Subsets are tried smallest first, so the first good subset found is the one returned.</p>
  </>} />
}
