import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const LETTERS = ['Q', 'W', 'E', 'R']

function WindowView({ step }) {
  const [left, right] = step.window ?? [-1, -1]
  const hasWindow = step.window !== null && step.window !== undefined
  return <div>
    <div aria-label="String positions" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {[...step.text].map((ch, i) => {
        const inside = hasWindow && i >= left && i <= right
        const role = hasWindow ? (i === left && i === right ? 'l, r' : i === left ? 'l' : i === right ? 'r' : '') : ''
        return <span key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', minWidth: 30 }}>
          <span style={{
            padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)',
            opacity: hasWindow && !inside ? 0.55 : 1,
            background: inside ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'transparent',
          }}>{ch}</span>
          <small style={{ color: 'var(--text-dim)', minHeight: '1em' }}>{role}</small>
        </span>
      })}
    </div>
    <p style={{ color: 'var(--text-dim)' }}>The highlighted window is the part we would replace. Letters outside it must each be at most {step.k}.</p>
    <table style={{ marginTop: 12 }}>
      <thead><tr><th scope="col">Letter</th><th scope="col">Outside window</th><th scope="col">Target</th></tr></thead>
      <tbody>{LETTERS.map(c => <tr key={c}><td>{c}</td><td>{step.outside[c]}</td><td>{step.k}</td></tr>)}</tbody>
    </table>
    <p>{hasWindow ? `Window l = ${left} to r = ${right} (length ${right - left + 1}).` : 'No window chosen yet.'} Best: {step.best ?? '—'}</p>
  </div>
}

export default function BalancedStringVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <WindowView step={step} />}
    renderReasoning={() => <p>The letters outside the replacement window must each fit within the target. Growing the window on the right and shrinking it on the left finds the shortest valid window.</p>} />
}
