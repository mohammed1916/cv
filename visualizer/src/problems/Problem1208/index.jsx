import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function EqualSubstringVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { cost, window, spent, maxCost, best } = step.snapshot
    const [from, to] = window
    return <>
      <div role="list" aria-label="Position costs" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {cost.map((value, position) => {
          const inside = window.length === 2 && position >= from && position <= to
          return <span key={position} role="listitem" data-index={position} style={{
            padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
            border: inside ? '2px solid var(--text)' : '1px solid var(--border)',
            background: inside ? '#0891b2' : 'transparent', color: inside ? '#fff' : 'var(--text)',
          }}>{value}</span>
        })}
      </div>
      <p>Spent {spent} of {maxCost}. Best window length: {best}.</p>
    </>
  }} renderReasoning={() => <p><strong>Sliding window:</strong> costs are nonnegative, so the window only needs to shrink from the left when it goes over budget.</p>} />
}
