import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function BracketView({ step }) {
  return <div>
    <div aria-label="Characters" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {[...step.text].map((ch, i) => {
        const marked = step.remove.includes(i)
        const current = i === step.position
        return <span key={i} style={{ padding: '4px 8px', border: `2px solid ${current ? '#0891b2' : 'currentColor'}`, borderRadius: 4, textDecoration: marked ? 'line-through' : 'none', color: marked ? '#dc2626' : 'inherit', opacity: i > step.position && step.position >= 0 ? 0.6 : 1 }}>{ch}</span>
      })}
    </div>
    <p>Waiting "(" stack (positions): <code>{step.openers.length ? step.openers.join(', ') : 'empty'}</code></p>
    <p>Marked for removal: <code>{step.remove.length ? step.remove.join(', ') : 'none'}</code></p>
    {step.result !== undefined && step.result !== null && <p role="status">Result: <code>{step.result || '(empty)'}</code></p>}
  </div>
}

export default function MinimumRemoveVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <BracketView step={step} />}
    renderReasoning={() => <p>Every closer that finds a waiting opener pairs with it. A closer with nothing waiting, and any opener still waiting at the end, cannot be part of a valid pair, so those brackets are the only ones removed.</p>} />
}
