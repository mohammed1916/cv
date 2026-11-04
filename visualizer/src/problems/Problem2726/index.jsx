import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'

const definition = {
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

const node = { padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minWidth: 56, textAlign: 'center' }

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      // Each method returns the same calculator, so the chain is one running value passed left to right.
      const ops = run.input.ops
      const applied = step.phase === 'done' || step.phase === 'step' ? ops.length : 0
      const failed = step.state?.error !== undefined
      return <section aria-label="Method chain" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <div style={{ ...node, borderColor: 'var(--primary)' }}><small style={{ color: 'var(--text-muted)' }}>init</small><div>{run.input.init}</div></div>
          {ops.map(([name, arg], index) => {
            const done = index < applied && !(failed && index === ops.length - 1)
            return <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: done ? 1 : 0.5 }}>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <div style={{ ...node, background: done ? 'var(--primary-glow)' : 'var(--surface)' }}><small>{name} {arg}</small></div>
            </div>
          })}
        </div>
        <p style={{ margin: 0, color: 'var(--text)' }}>
          {failed ? <>Stopped: <code>{step.state.error}</code></> : <>Running value: <code>{step.state?.value ?? run.input.init}</code></>}
        </p>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Each method returns the calculator itself, so the next call starts from the value the last one left.</p>
      </section>
    }}
    renderReasoning={() => <>{model.WHY.map((text, index) => <p key={index}>{text}</p>)}</>} />
}
