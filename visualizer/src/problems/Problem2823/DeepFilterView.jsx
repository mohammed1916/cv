import TreeOutline from '../../components/shared/TreeOutline'
import { PREDICATES } from './algorithm'

const chip = { display: 'inline-block', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '.8rem' }

// The input on the left, the result growing on the right, and the recursion path above both.
export default function DeepFilterView({ run, step }) {
  return <section aria-label="Deep filter state" style={{ color: 'var(--text)' }}>
    <p style={{ margin: '0 0 8px' }}><strong>fn:</strong> <code>{PREDICATES[run.input.fn].label}</code></p>
    <div aria-label="Recursion path" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 10 }}>
      <strong style={{ marginRight: 4 }}>Call stack:</strong>
      {step.stack.length
        ? step.stack.map((name, i) => <span key={i} style={{ ...chip, ...(i === step.stack.length - 1 ? { outline: '2px solid var(--primary)' } : null) }}>{name}</span>)
        : <em style={{ color: 'var(--text-muted)' }}>empty</em>}
    </div>
    {step.test && <p data-test-result={String(step.test.passed)} style={{ margin: '0 0 10px', padding: '4px 8px', borderLeft: `4px solid ${step.test.passed ? 'var(--success)' : 'var(--error)'}`, background: 'var(--surface2)' }}>
      <code>fn({step.test.value})</code> is <strong style={{ color: step.test.passed ? 'var(--success)' : 'var(--error)' }}>{String(step.test.passed)}</strong>
    </p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <TreeOutline title="Input" root={step.tree} roles={step.roles} tags={step.tags} note="fades when removed" />
      </div>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <TreeOutline title="Result so far" root={step.built} roles={{}} tags={{}} note="array positions close up" />
      </div>
    </div>
    {step.output !== undefined && <output aria-label="Final result" style={{ display: 'block', marginTop: 8, fontFamily: 'monospace', overflowWrap: 'anywhere' }}><strong>returns </strong>{step.output}</output>}
  </section>
}
