import { codeOf } from './algorithm'
import './BinaryCodeView.css'

export default function BinaryCodeView({ run, step }) {
  const num = run.input
  const shifted = num + 1
  const digits = step.ordered ? step.ordered.split('') : step.bits.slice().reverse()
  const lo = Math.max(0, num - 6)
  const hi = Math.min(num + 2, num + 6)
  const ladder = []
  for (let k = lo; k <= hi; k += 1) ladder.push(k)
  return <div className="code-view">
    <p className="code-view__eq">num = {num} · num + 1 = {shifted} · binary of {shifted}: <strong>{shifted.toString(2)}</strong></p>
    <section aria-label="Bits found so far">
      <span className="code-view__label">bits</span>
      {step.bits.length === 0 && <span className="code-view__empty">none yet</span>}
      {step.ordered ? digits.map((bit, k) => <span key={k} className={`code-view__bit${k === 0 && step.phase !== 'done' ? ' is-leading' : ''}${step.phase === 'drop' || step.phase === 'done' ? (k === 0 ? ' is-dropped' : ' is-kept') : ''}`}>{bit}</span>)
        : step.bits.map((bit, k) => <span key={k} className={`code-view__bit${k === step.bits.length - 1 ? ' is-new' : ''}`}>{bit}</span>)}
      {step.result !== null && <span className="code-view__result" aria-label="Encoding">→ "{step.result}"</span>}
    </section>
    <section aria-label="Sequence around this number">
      <span className="code-view__label">sequence</span>
      <ol className="code-view__ladder">
        {ladder.map(k => <li key={k} className={k === num ? 'is-target' : ''}>
          <span>{k}</span><code>{codeOf(k) === '' ? 'ε' : codeOf(k)}</code>
        </li>)}
      </ol>
    </section>
  </div>
}
