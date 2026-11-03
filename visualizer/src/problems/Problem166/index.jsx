import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '166',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with numerator and denominator (JSON)',
  url: 'https://leetcode.com/problems/fraction-to-recurring-decimal/',
  complexity: 'O(d) time and O(d) space in the worst case: the remainder map holds at most d - 1 distinct remainders.',
  examples: [
    { label: 'Thirds', input: '{"numerator":2,"denominator":3}' },
    { label: 'Negative half', input: '{"numerator":-1,"denominator":2}' },
    { label: 'Long cycle', input: '{"numerator":4,"denominator":333}' },
  ],
}

const cell = { padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center' }

export default function FractionToDecimal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { whole, digits, remainder, seen, cycleStart } = step.snapshot
    const digitList = digits ? digits.split('') : []
    return <>
      <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }} aria-label="Current result">
        {run.input.numerator} / {run.input.denominator} → {whole !== null && whole !== undefined ? (run.result.startsWith('-') ? '-' : '') + Math.abs(whole) : ''}
        {digitList.length > 0 && <>.{digitList.map((digit, i) => <span key={i} style={{
          padding: '0 2px', borderBottom: cycleStart !== null && i >= cycleStart ? '3px solid var(--primary)' : 'none',
        }}>{digit}</span>)}</>}
        {remainder !== null && remainder !== 0 && <small> · remainder {remainder}</small>}
      </p>
      {seen && seen.length > 0 && <table aria-label="Remainders seen" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>Remainder</th><th style={cell}>Digit position</th></tr></thead>
        <tbody>{seen.map(entry => <tr key={entry.remainder} style={{
          background: cycleStart !== null && entry.position === cycleStart ? '#fde68a' : 'transparent', color: '#1c1917',
        }}><td style={cell}>{entry.remainder}</td><td style={cell}>{entry.position}</td></tr>)}</tbody>
      </table>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Long division:</strong> each fractional digit comes from multiplying the remainder by 10. The next digit and remainder depend only on the current remainder.</p>
    <p><strong>Repeats:</strong> there are only denominator-many possible remainders. The first repeated remainder fixes where the repeating group starts, so the digits from that position are wrapped in parentheses.</p>
  </>} />
}
