import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'

const definition = {
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      // A time axis from 0 to the cancel time: each call is a dot, and the cancel is a vertical line.
      const { periodMs, cancelMs } = run.input
      const span = Math.max(cancelMs, 1)
      const pct = t => `${(t / span) * 100}%`
      const calls = step.state?.calls ?? []
      const ticks = []
      for (let t = 0; t < cancelMs; t += periodMs) ticks.push(t)
      return <section aria-label="Call timeline" style={{ display: 'grid', gap: 8 }}>
        <div style={{ position: 'relative', height: 56, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6 }}>
          {ticks.map(t => <div key={t} title={`scheduled ${t}ms`} style={{ position: 'absolute', left: pct(t), top: 20, width: 12, height: 12, marginLeft: -6, borderRadius: '50%', border: '2px solid var(--primary)', background: calls.includes(t) ? 'var(--primary)' : 'transparent' }} />)}
          <div aria-label="Cancel time" style={{ position: 'absolute', left: pct(cancelMs), top: 0, bottom: 0, width: 2, background: 'var(--error)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}><span>0ms</span><span>cancel at {cancelMs}ms</span></div>
        <p style={{ margin: 0, color: 'var(--text)' }}>Calls so far: <code>{JSON.stringify(calls)}</code>. Period {periodMs}ms.</p>
      </section>
    }}
    renderReasoning={() => <>{model.WHY.map((text, index) => <p key={index}>{text}</p>)}</>} />
}
