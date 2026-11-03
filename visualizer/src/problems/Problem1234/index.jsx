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
  return <div>
    <div aria-label="String positions" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {[...step.text].map((ch, i) => {
        const inside = i >= left && i <= right
        return <span key={i} style={{ padding: '4px 8px', border: '1px solid currentColor', borderRadius: 4, opacity: inside ? 1 : 0.55, background: inside ? 'rgba(8,145,178,0.25)' : 'transparent' }}>{ch}</span>
      })}
    </div>
    <table style={{ marginTop: 12 }}>
      <thead><tr><th scope="col">Letter</th><th scope="col">Outside window</th><th scope="col">Target</th></tr></thead>
      <tbody>{LETTERS.map(c => <tr key={c}><td>{c}</td><td>{step.outside[c]}</td><td>{step.k}</td></tr>)}</tbody>
    </table>
    <p>{step.window ? `Window ${left}–${right} (length ${right - left + 1}).` : 'No window chosen yet.'} Best: {step.best ?? '—'}</p>
  </div>
}

export default function BalancedStringVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <WindowView step={step} />}
    renderReasoning={() => <p>The letters outside the replacement window must each fit within the target. Growing the window on the right and shrinking it on the left finds the shortest such window.</p>} />
}
