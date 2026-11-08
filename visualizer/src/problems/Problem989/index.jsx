import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '989',
  title: 'Add to Array-Form of Integer',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num: a list of decimal digits, and k: a whole number from 0 to 99999',
  url: 'https://leetcode.com/problems/add-to-array-form-of-integer/',
  complexity: 'O(max(n, log k)) time: one step per digit position. The result has one extra digit at most.',
  examples: [
    { label: 'Carry across zeros', input: JSON.stringify({ num: [3, 0, 0, 7], k: 95 }) },
    { label: 'Long carry chain', input: JSON.stringify({ num: [9, 9, 8], k: 13 }) },
    { label: 'Longer addend', input: JSON.stringify({ num: [4, 1], k: 2046 }) },
    { label: 'No change when k is zero', input: '{"num":[1,2,0,0],"k":0}' },
    { label: 'Single digit with zero', input: '{"num":[0],"k":0}' },
    { label: 'Twelve nines with the largest k', input: '{"num":[9,9,9,9,9,9,9,9,9,9,9,9],"k":99999}' },
    { label: 'Long run: twelve digits', input: '{"num":[7,0,0,4,6,7,7,1,0,2,3,2],"k":12345}' },
  ],
}

const cellStyle = active => ({
  minWidth: 40, padding: 12, borderRadius: 6, textAlign: 'center', color: 'var(--text)',
  border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--surface2)' : 'var(--surface)',
})

export default function Problem989() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { num } = run.input
    const kDigits = String(run.input.k).split('')
    // Right-align both numbers so each column is one position of the addition.
    const width = Math.max(num.length, kDigits.length)
    const pad = list => Array.from({ length: width - list.length }, () => null).concat(list)
    const numRow = pad(num)
    const kRow = pad(kDigits.map(Number))
    const cursorColumn = step.cursor >= 0 ? width - (num.length - step.cursor) : -1
    return <section aria-label="Column addition" style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {numRow.map((digit, column) => <div key={`n${column}`} style={cellStyle(column === cursorColumn)}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>{column === cursorColumn ? 'num, pointer i' : 'num'}</small>
          <strong>{digit ?? ''}</strong>
        </div>)}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {kRow.map((digit, column) => <div key={`k${column}`} style={cellStyle(false)}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>k</small>
          <strong>{digit ?? ''}</strong>
        </div>)}
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>
        Carry in: <strong>{step.carryIn}</strong>{step.total !== null ? <> · sum here: <strong>{step.total}</strong> · carry out: <strong>{step.carryOut}</strong></> : null}
      </p>
      <p style={{ margin: 0, color: 'var(--text)' }}>Result so far, left to right: <strong>{step.digits.length ? step.digits.join(' ') : '—'}</strong></p>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>The highlighted column is the position being added. The sum is written from the right.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
