import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/',
}

const chip = { display: 'inline-flex', alignItems: 'center', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'monospace', marginRight: 6 }

export default function RemoveAdjacentDuplicatesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, k } = run.input
    const at = step.snapshot.index
    return <>
      <div aria-label="String" role="img" style={{ marginBottom: 12 }}>
        {[...s].map((ch, i) => <span key={i} style={{ ...chip, background: i === at ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : i < at ? 'var(--surface2)' : 'transparent', color: 'var(--text)', fontWeight: i === at ? 700 : 400 }}>{ch}</span>)}
      </div>
      <p>Run stack, bottom to top (a run is removed at {k}):</p>
      <div aria-label="Run stack" style={{ minHeight: 40 }}>
        {step.snapshot.stack.length === 0
          ? <span style={{ color: 'var(--text-dim)' }}>empty</span>
          : step.snapshot.stack.map((run, i) => <span key={i} style={{ ...chip, borderColor: run.n === k - 1 ? 'var(--text)' : 'var(--border)' }}>{run.ch} × {run.n}</span>)}
      </div>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why a stack of runs:</strong> each entry stores one character and how many times it appears in a row. Removing a full run exposes the run beneath, which may then merge with the next character.</p>
    {step.snapshot.removed && <p>The run of “{step.snapshot.removed}” has just been removed.</p>}
  </>} />
}
