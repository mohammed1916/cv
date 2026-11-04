import OperationLog from '../../components/shared/OperationLog'

const STAGES = [
  { id: 'read', title: 'Read', text: m => `obj[${m}]` },
  { id: 'trap', title: 'Get trap', text: m => `get(target, ${m})` },
  { id: 'closure', title: 'Closure', text: m => `() => ${m}` },
  { id: 'call', title: 'Call', text: () => 'closure()' },
  { id: 'returned', title: 'Return', text: m => m },
]

const box = { border: '2px solid var(--border)', borderRadius: 8, padding: '8px 10px', background: 'var(--surface2)', color: 'var(--text)' }

// One call travelling through the Proxy, the empty target it never touches, and the contrast with a plain object.
export default function ProxyCallView({ step }) {
  const shown = step.method === null ? 'name' : JSON.stringify(step.method)
  const reached = STAGES.findIndex(stage => stage.id === step.stage)
  return <section aria-label="Proxy call path" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <ol aria-label="Stages of one call" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0, alignItems: 'stretch' }}>
      {STAGES.map((stage, index) => {
        const active = index === reached
        const passed = reached >= 0 && index < reached
        return <li key={stage.id} data-stage={stage.id} data-state={active ? 'active' : passed ? 'passed' : 'waiting'} aria-current={active ? 'step' : undefined}
          style={{ ...box, flex: '1 1 110px', minWidth: 0, borderColor: active ? 'var(--primary)' : passed ? 'var(--success)' : 'var(--border)', opacity: active || passed ? 1 : 0.55 }}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{index + 1}. {stage.title}</small>
          <code style={{ display: 'block', overflowWrap: 'anywhere', fontWeight: active ? 700 : 400 }}>{stage.text(shown)}</code>
        </li>
      })}
    </ol>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <div data-panel="target" style={{ ...box, flex: '1 1 180px' }}>
        <strong>Target object</strong>
        <div><code>{'{ }'}</code> with {step.targetKeys} own keys</div>
        <small style={{ color: 'var(--text-muted)' }}>Get trap has fired {step.trapReads} time{step.trapReads === 1 ? '' : 's'}; nothing is ever written here.</small>
      </div>
      <div data-panel="plain" style={{ ...box, flex: '1 1 240px' }}>
        <strong>The same call on a plain {'{ }'}</strong>
        <div style={{ overflowWrap: 'anywhere' }}>{step.plain ?? 'Choose any name: only a trap can answer for names that do not exist yet.'}</div>
      </div>
    </div>
    <OperationLog title="Calls made" ops={step.ops} current={step.at} through={step.at >= 0 ? step.at : step.through ?? -1} />
  </section>
}
