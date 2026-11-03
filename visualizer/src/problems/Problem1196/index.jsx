import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const CAPACITY = 5000

export default function ApplesBasketVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, taken, index, total, count } = step.snapshot
    return <>
      <div role="list" aria-label="Sorted apples" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sorted.map((weight, position) => {
          const isTaken = position < taken.length
          const isCurrent = index === position
          return <span key={position} role="listitem" data-index={position} style={{
            padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
            border: isCurrent ? '2px solid var(--text)' : '1px solid var(--border)',
            background: isTaken ? '#0891b2' : 'transparent', color: isTaken ? '#fff' : 'var(--text)',
          }}>{weight}</span>
        })}
      </div>
      <p>Basket weight {total} of {CAPACITY}. Apples taken: {count}.</p>
      <output aria-label="Count so far">{`Count: ${count}`}</output>
    </>
  }} renderReasoning={() => <p><strong>Greedy choice:</strong> taking lighter apples first gives the largest count. Once the lightest remaining apple does not fit, no heavier apple after it can fit.</p>} />
}
