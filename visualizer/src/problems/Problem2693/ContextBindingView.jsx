import RecordStateTable from '../../components/shared/RecordStateTable'
import { FUNCTIONS, POLYFILL_SOURCE, show } from './algorithm'

const pill = { display: 'inline-block', padding: '2px 8px', margin: 2, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', overflowWrap: 'anywhere' }

// The JavaScript itself, since this problem is about JavaScript semantics.
function SourcePane({ title, lines, activeLine }) {
  return <figure style={{ flex: '1 1 280px', minWidth: 0, margin: 0 }}>
    <figcaption style={{ fontWeight: 600, marginBottom: 4 }}>{title}</figcaption>
    <pre style={{ margin: 0, padding: 8, overflowX: 'auto', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12 }}>
      {lines.map((line, index) => <code key={index} data-line={index} data-active={index === activeLine ? 'true' : undefined}
        style={{ display: 'block', padding: '1px 4px', borderLeft: `3px solid ${index === activeLine ? 'var(--primary)' : 'transparent'}`, background: index === activeLine ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent', fontWeight: index === activeLine ? 700 : 400 }}>{line || ' '}</code>)}
    </pre>
  </figure>
}

// Where the call's arguments end up: the first feeds this, the others feed the parameters.
function ArgumentFlow({ run, step }) {
  const { args } = run.input
  const spec = FUNCTIONS[run.input.fn]
  const isBound = step.thisValue === 'context'
  return <section aria-label="Where each argument goes">
    <strong>The call</strong>
    <p style={{ margin: '2px 0 6px', overflowWrap: 'anywhere' }}><code>{step.callText}</code></p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <div data-slot="this" data-bound={isBound ? 'true' : 'false'} style={{ flex: '1 1 180px', minWidth: 0, padding: 8, borderRadius: 8, border: `2px ${isBound ? 'solid' : 'dashed'} ${isBound ? 'var(--primary)' : 'var(--border)'}` }}>
        <small style={{ color: 'var(--text-muted)' }}>this</small>
        <div style={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{isBound ? `the context object ${show(args[0])}` : 'undefined (no object yet)'}</div>
        {step.split && !isBound && <small style={{ color: 'var(--text-muted)' }}>Waiting: {show(args[0])} is held as the context.</small>}
      </div>
      <div data-slot="params" style={{ flex: '1 1 180px', minWidth: 0, padding: 8, borderRadius: 8, border: `2px ${step.params.length ? 'solid' : 'dashed'} ${step.params.length ? 'var(--primary)' : 'var(--border)'}` }}>
        <small style={{ color: 'var(--text-muted)' }}>parameters</small>
        <div>
          {step.params.length
            ? step.params.map(param => <span key={param.name} style={pill}>{param.name} = {param.value}</span>)
            : <span style={{ color: 'var(--text-muted)' }}>{spec.params.length ? 'not bound yet' : 'this function takes none'}</span>}
        </div>
      </div>
    </div>
  </section>
}

function CallStack({ stack }) {
  return <section aria-label="Call stack">
    <strong>Call stack</strong>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 4, minHeight: 30 }}>
      {stack.length
        ? stack.map((name, index) => <span key={name} style={{ display: 'contents' }}>
          {index > 0 && <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>→</span>}
          <span style={{ ...pill, fontWeight: index === stack.length - 1 ? 700 : 400, borderColor: index === stack.length - 1 ? 'var(--primary)' : 'var(--border)' }}>{name}</span>
        </span>)
        : <span style={{ color: 'var(--text-muted)' }}>empty</span>}
    </div>
  </section>
}

export default function ContextBindingView({ run, step }) {
  const spec = FUNCTIONS[run.input.fn]
  const rows = step.contextRows.map(row => ({ key: row.key, value: row.value, role: row.temporary ? 'temporary' : '' }))
  const activeRow = rows.findIndex(row => row.key === step.activeKey)
  return <section aria-label="Function context state" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <ArgumentFlow run={run} step={step} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <SourcePane title="callPolyfill" lines={POLYFILL_SOURCE} activeLine={step.polyfillLine} />
      <SourcePane title={`Sample function: ${run.input.fn}`} lines={spec.source} activeLine={step.bodyLine} />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <RecordStateTable label="Context object" columns={['key', 'value', 'role']} rows={rows} activeRow={activeRow} />
      </div>
      <div style={{ flex: '1 1 240px', minWidth: 0, display: 'grid', gap: 8 }}>
        <CallStack stack={step.stack} />
        <section aria-label="Accesses through this">
          <strong>Accesses through this</strong>
          {step.reads.length
            ? <ol style={{ margin: '4px 0 0', paddingLeft: 20 }}>{step.reads.map((text, index) => <li key={index}><code style={{ overflowWrap: 'anywhere' }}>{text}</code></li>)}</ol>
            : <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>None yet</p>}
        </section>
      </div>
    </div>
    {step.plainFailure && <p role="note" style={{ margin: 0, padding: 8, borderRadius: 6, border: '1px solid var(--warning)', overflowWrap: 'anywhere' }}>Plain call {run.input.fn}(...) fails: {step.plainFailure}</p>}
    {step.hasReturned && <output aria-label="Returned value" style={{ fontWeight: 700 }}>Returned: {show(step.returned)}</output>}
  </section>
}
