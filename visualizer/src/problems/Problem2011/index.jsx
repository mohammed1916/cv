import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2011',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as JSON strings',
  url: 'https://leetcode.com/problems/final-value-of-variable-after-performing-operations/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Two downs then up', input: '["--X","--X","X++"]' },
    { label: 'Up and down', input: '["X++","--X","++X"]' },
    { label: 'Single', input: '["X--"]' },
  ],
}

export default function FinalValueOfVariable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { ops, index, x } = step.snapshot
    return <>
      <ol aria-label="Operations" style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ops.map((op, i) => <li key={i} style={{
          fontFamily: 'monospace', padding: '4px 8px', color: 'var(--text)',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`,
          background: i < index ? 'var(--surface2)' : 'transparent',
        }}>{op}</li>)}
      </ol>
      <p>X = <strong>{x}</strong>{index >= 0 ? ` after operation ${index + 1}` : ' before any operation'}.</p>
    </>
  }} renderReasoning={() => <p>Each operation contains exactly one sign, which decides whether X goes up or down by one.</p>} />
}
