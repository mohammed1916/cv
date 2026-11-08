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
    { label: 'Shortest balanced string', input: '{\"s\":\"LR\"}' },
    { label: 'Starts with R, balances in one step', input: '{\"s\":\"RL\"}' },
    { label: 'Long run: 200 shuffled letters', input: '{\"s\":\"RRRLLRLLLLLRRLRRLLLLRLRRRLLRRLLRRRRRRLLRLLRLLLRRRRLRLRRLLLRLRLRRRRRRLLRLLLLRLLRRLRLRLLRLLRLRLRLRLLLLLRLLRLLLRLRRLRRRLLRLRLRRLLLLRLLRRLRRLLLLRLRRLRRRLRRRLRLLLRLLLRRLLLRLLRRLLRRLRRRLLRRRRRLLRRRRLRRLRRLR\"}' },
  ],
}

export default function SplitBalancedStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const { index, balance, pieces, piece } = step.snapshot
    const start = index - piece.length + 1
    // Running balance after each letter, shown under the letter so the zero points are visible.
    const balances = []
    let running = 0
    for (const ch of s) { running += ch === 'L' ? 1 : -1; balances.push(running) }
    const cell = { width: 30, textAlign: 'center', fontFamily: 'monospace', padding: '2px 0' }
    return <div aria-label="Letters" style={{ display: 'grid', gap: 6, justifyItems: 'start', overflowX: 'auto', maxWidth: '100%' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...s].map((ch, i) => {
          const role = i === index && piece ? (i === start ? 'l, r' : 'r') : i === start && index >= 0 ? 'l' : ''
          const inPiece = index >= 0 && i >= start && i <= index
          return <div key={i} data-index={i} style={{ ...cell, display: 'grid', gap: 2, border: 'none' }}>
            <span style={{
              border: i === index ? '2px solid var(--text)' : '1px solid var(--border)',
              background: inPiece ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'transparent',
              color: 'var(--text)', padding: '2px 0',
            }}>{ch}</span>
            <small style={{ color: 'var(--text-dim)', minHeight: '1em' }}>{role}</small>
            <small style={{ color: i <= index && balances[i] === 0 ? 'var(--text)' : 'var(--text-dim)', fontWeight: i <= index && balances[i] === 0 ? 700 : 400 }}>
              {i <= index ? balances[i] : ''}
            </small>
          </div>
        })}
      </div>
      <output aria-label="Balance and pieces">{`Balance ${balance} · pieces ${pieces}${piece && index >= 0 ? ` · current piece from l = ${start} to r = ${index}` : ''}`}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
