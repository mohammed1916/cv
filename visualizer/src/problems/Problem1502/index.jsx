import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1502',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/can-make-arithmetic-progression-from-sequence/',
  complexity: 'O(n log n) time for the sort and O(n) for the gap check, with O(n) space for the sorted copy.',
  examples: [
    { label: 'Shuffled', input: '{"arr":[7,1,5,9,3]}' },
    { label: 'Uneven gap', input: '{"arr":[4,1,9,2]}' },
    { label: 'Negatives', input: '{"arr":[-6,0,-3,3]}' },
  ],
}

export default function ArithmeticFromSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, pos, step: gap, ok } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted values and gaps" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {sorted.map((value, i) => <div key={i} style={{ textAlign: 'center', fontFamily: 'monospace' }}>
          {i > 0 && <small style={{ display: 'block', color: pos === i && ok === false ? '#b91c1c' : 'var(--muted, #78716c)' }}>gap {value - sorted[i - 1]}</small>}
          <div style={{ minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', border: `${pos === i ? 2 : 1}px solid ${pos === i ? 'var(--text)' : 'var(--border)'}`, background: pos !== null && i <= pos && i > 0 ? 'var(--surface2)' : 'transparent' }}>{value}</div>
        </div>)}
      </div>
      <p>{gap === null ? `Required gap: ${gap ?? 'not yet known'}` : `Required gap: ${gap}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort first:</strong> in a progression the sorted order is the only order where neighbours differ by the same step, so sorting loses nothing.</p>
    <p><strong>One check:</strong> compare each neighbouring gap with the first gap; any mismatch rules the sequence out.</p>
  </>} />
}
