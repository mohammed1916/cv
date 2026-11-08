import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '976',
  title: 'Largest Perimeter Triangle',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sides: a list of stick lengths',
  url: 'https://leetcode.com/problems/largest-perimeter-triangle/',
  complexity: 'O(n log n) for the sort, then one pass over the sorted lengths.',
  examples: [
    { label: 'First triple works', input: JSON.stringify({ sides: [5, 2, 4] }) },
    { label: 'Long side too big', input: JSON.stringify({ sides: [1, 3, 2, 12] }) },
    { label: 'Several candidates', input: JSON.stringify({ sides: [9, 4, 7, 2, 6] }) },
    { label: 'Smallest input: three ones', input: '{"sides":[1,1,1]}' },
    { label: 'Repeated lengths', input: '{"sides":[2,2,3,3]}' },
    { label: 'Maximum lengths', input: '{"sides":[1000,1000,1000,1,1]}' },
    { label: 'No triangle is possible', input: '{"sides":[1,2,3]}' },
    { label: 'Long run: 12 sides', input: '{"sides":[565,70,607,981,952,80,790,134,659,814,278,685]}' },
  ],
}

export default function Problem976() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = step.sorted
    const i = step.i
    const role = index => {
      if (i === null) return ''
      if (index === i) return 'a (largest)'
      if (index === i + 1) return 'b'
      if (index === i + 2) return 'c'
      return ''
    }
    return <>
      <div role="list" aria-label="Lengths sorted largest first" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {sorted.map((value, index) => {
          const inTriple = i !== null && index >= i && index <= i + 2
          return <div key={index} role="listitem" data-index={index} style={{
            minWidth: 64, padding: '8px 10px', borderRadius: 8, textAlign: 'center',
            border: `2px solid ${inTriple ? 'var(--primary)' : 'var(--border)'}`,
            background: inTriple ? 'var(--primary-glow)' : 'var(--surface)', color: 'var(--text)',
          }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>[{index}]</small>
            <strong>{value}</strong>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>{role(index) || ' '}</small>
          </div>
        })}
      </div>
      {i !== null && <p style={{ margin: 0, color: 'var(--text)' }}>
        Triple: {sorted[i]}, {sorted[i + 1]}, {sorted[i + 2]}. Test: {sorted[i + 1]} + {sorted[i + 2]} = {sorted[i + 1] + sorted[i + 2]} against {sorted[i]}.
      </p>}
      {step.answer !== null && <p style={{ margin: 0, color: 'var(--text)' }}>Perimeter: <strong>{step.answer}</strong></p>}
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
