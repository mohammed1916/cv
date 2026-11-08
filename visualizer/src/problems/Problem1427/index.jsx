import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1427',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and shift (JSON)',
  url: 'https://leetcode.com/problems/perform-string-shifts/',
  complexity: 'O(m + n) time and O(n) space: sum the operations, reduce once, then rotate once.',
  examples: [
    { label: 'Cancelling shifts', input: '{"s":"abcde","shift":[[0,1],[1,2],[1,3]]}' },
    { label: 'Single right shift', input: '{"s":"abcde","shift":[[1,1]]}' },
    { label: 'Full cycle', input: '{"s":"wxyz","shift":[[0,8],[1,0]]}' },
    { label: 'One letter, no shift', input: '{"s":"a","shift":[[1,0]]}' },
    { label: 'Equal letters cancel', input: '{"s":"aaaa","shift":[[0,1],[1,1]]}' },
    { label: 'Largest shift amounts', input: '{"s":"zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz","shift":[[0,100],[1,100]]}' },
    { label: 'Long run: 30 letters, 20 shifts', input: '{"s":"jpkiidguvozubmvakijsudjayzgrfp","shift":[[0,98],[1,89],[1,23],[0,30],[0,75],[1,17],[1,0],[0,87],[0,90],[1,74],[1,78],[1,74],[1,85],[0,12],[0,67],[1,65],[1,81],[0,65],[0,38],[0,50]]}' },
  ],
}

export default function PerformStringShifts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const { net, r, result, direction, amount, opIndex } = step.snapshot
    const n = s.length
    const rotated = r === undefined ? s : s.slice(n - r) + s.slice(0, n - r)
    return <>
      <div role="img" aria-label="String ring" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...rotated].map((ch, i) => <div key={i} style={{
          minWidth: 36, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `1px solid ${r && i < r ? 'var(--text)' : 'var(--border)'}`,
          background: r && i < r ? 'var(--primary)' : 'transparent', color: r && i < r ? 'var(--text)' : 'var(--text)',
        }}>{ch}</div>)}
      </div>
      <p>{opIndex !== null && opIndex !== undefined ? `Operation ${opIndex + 1}: ${direction === 1 ? 'right' : 'left'} by ${amount}.` : 'Operations not applied yet.'}</p>
      <p>Net shift (right positive): <strong>{net}</strong>{r !== undefined ? ` — rotation ${r} for length ${n}` : ''}</p>
      {result !== undefined && <p>Result: <code>{result}</code></p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Net first:</strong> a right shift and a left shift cancel by their signed amounts, so only the total matters.</p>
    <p><strong>Modulo once:</strong> rotating by the length of the string returns it unchanged, so the net can be reduced before the single rotation.</p>
  </>} />
}
