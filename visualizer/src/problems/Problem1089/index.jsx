import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1089',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of single digits',
  url: 'https://leetcode.com/problems/duplicate-zeros/',
  complexity: 'O(n) time and O(1) extra space. Writes go backward, so no unread value is overwritten.',
  examples: [
    { label: 'Zeros in the middle', input: '[1,0,2,3,0,4,5,0]' },
    { label: 'Leading zero', input: '[0,3,9]' },
    { label: 'No zeros', input: '[8,9]' },
  ],
}

export default function DuplicateZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, n, src, last, value } = step.state
    const overflow = Math.max(0, (last ?? n - 1) - (n - 1))
    return <div>
      <div role="img" aria-label="Working array" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {arr.map((cell, index) => <div key={index} data-index={index} style={{
          minWidth: 44, padding: '6px 8px', textAlign: 'center',
          border: `2px solid ${index === src ? '#f59e0b' : index === last ? 'var(--accent, #0891b2)' : 'var(--border)'}`,
        }}>
          <div>{cell}</div>
          <small>{index}</small>
        </div>)}
      </div>
      <p aria-label="Write pointer">{last === null || last === undefined ? 'Write pointer not set' : `Write pointer at virtual index ${last}${last >= n ? ' (past the end)' : ''}`}</p>
      {src !== null && <p>{`Reading original index ${src}, value ${value}.`}</p>}
      {overflow > 0 && <p>{`${overflow} virtual slot(s) lie past the array end and are discarded.`}</p>}
    </div>
  }} renderReasoning={() => <>
    <p><strong>Count first:</strong> each zero needs one extra slot, so the expanded length is the original length plus the zero count.</p>
    <p><strong>Backward writes:</strong> reading from the right means every write lands at or after the next unread original value, so nothing is lost.</p>
  </>} />
}
