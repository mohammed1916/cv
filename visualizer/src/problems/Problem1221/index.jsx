import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  complexity: 'O(n) time and O(1) extra space for a string of length n.',
  examples: [
    { label: 'Mixed nesting', input: '{"s":"LRLLRRLRRRLLLRRL"}' },
    { label: 'One section', input: '{"s":"LLLLRRRR"}' },
    { label: 'Pairs', input: '{"s":"LRLRLRLR"}' },
    { label: 'Reversed start', input: '{"s":"RRLLRLRL"}' },
  ],
}

export default function SplitBalancedStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const { index, balance, pieces, piece } = step.snapshot
    const start = index - piece.length + 1
    return <div aria-label="Letters" style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 3, fontFamily: 'monospace' }}>
        {[...s].map((ch, i) => <span key={i} data-index={i} style={{
          width: 26, textAlign: 'center', border: '1px solid var(--border)',
          background: i === index ? 'var(--surface2)' : 'transparent', fontWeight: i === index ? 700 : 400,
        }}>{ch}</span>)}
      </div>
      <output aria-label="Balance and pieces">{`Balance ${balance} · pieces ${pieces}${piece && index >= 0 ? ` · current piece starts at ${start}` : ''}`}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
