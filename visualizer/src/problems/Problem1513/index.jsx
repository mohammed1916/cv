import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1513',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string of 0 and 1 characters',
  url: 'https://leetcode.com/problems/number-of-substrings-with-only-1s/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the current block length and the running total.',
  examples: [
    { label: 'Two blocks', input: '0110111' },
    { label: 'Single block', input: '111' },
    { label: 'No ones', input: '0000' },
  ],
}

export default function OnesSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, run: block, total } = step.snapshot
    const chars = [...run.input.s]
    return <>
      <div role="img" aria-label="Binary string" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {chars.map((ch, i) => <div key={i} data-index={i} style={{
          minWidth: 34, padding: '4px 6px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: ch === '1' ? 'var(--surface2)' : 'transparent',
        }}><div>{ch}</div><small>{i}</small></div>)}
      </div>
      <p>Current block of ones: <strong>{block}</strong> · Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Ending here:</strong> a block of length L contributes L substrings that end at the current 1, namely the ones that start at each position of the block.</p>
    <p><strong>Breaking the block:</strong> a 0 cannot be part of any all-ones substring, so the block length resets.</p>
  </>} />
}
