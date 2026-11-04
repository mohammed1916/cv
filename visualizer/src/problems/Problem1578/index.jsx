import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1578',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with colors (string) and neededTime (JSON list)',
  url: 'https://leetcode.com/problems/minimum-time-to-make-rope-colorful/',
  complexity: 'O(n) time and O(1) extra space: one pass that tracks the current group sum and maximum.',
  examples: [
    { label: 'Sample A', input: '{"colors":"aabaa","neededTime":[1,2,3,4,1]}' },
    { label: 'Long run', input: '{"colors":"cccca","neededTime":[5,1,7,2,3]}' },
    { label: 'No repeats', input: '{"colors":"abcd","neededTime":[4,3,2,1]}' },
  ],
}

const KEEP = 'color-mix(in srgb, var(--success) 30%, transparent)'
const DROP = 'color-mix(in srgb, var(--error) 22%, transparent)'

export default function ColourfulRope() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { colors, neededTime } = run.input
    const { start, end, j, best, total, removed } = step.snapshot
    const runs = []
    colors.split('').forEach((c, k) => {
      if (k === 0 || c !== colors[k - 1]) runs.push({ color: c, from: k, to: k })
      else runs[runs.length - 1].to = k
    })
    return <>
      {runs.map(run2 => {
        const runTotal = neededTime.slice(run2.from, run2.to + 1).reduce((a, b) => a + b, 0)
        const active = start >= 0 && run2.from === start
        const runDone = start >= 0 && (start > run2.from || (start === run2.from && end >= 0))
        return <div key={run2.from} aria-label={`Run of ${run2.color}`} style={{
          border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`, borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Run of "{run2.color}" at indices {run2.from} to {run2.to} · total cost {runTotal}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {neededTime.slice(run2.from, run2.to + 1).map((cost, offset) => {
              const k = run2.from + offset
              const seen = runDone || (active && k <= j)
              const isRemoved = removed.includes(k)
              const isKept = runDone ? !isRemoved : active && k === best
              return <div key={k} data-index={k} style={{
                minWidth: 56, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
                border: `${k === j ? 2 : 1}px solid ${k === j ? 'var(--text)' : 'var(--border)'}`,
                background: isRemoved ? DROP : isKept ? KEEP : 'var(--surface2)', opacity: seen || start < 0 ? 1 : 0.55 }}>
                <div>{run2.color} · {cost}</div><small>{k}{isKept ? ' keep' : ''}</small>
              </div>
            })}
          </div>
        </div>
      })}
      <p>Green: the most expensive balloon kept in its run. Red: balloons paid for and removed. Outlined: the balloon being compared.</p>
      <p>Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Groups:</strong> only neighbours with the same colour conflict, so each run is handled on its own.</p>
    <p><strong>Within a run:</strong> keep the most expensive balloon and remove the rest, which costs the run total minus that maximum.</p>
  </>} />
}
