import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Column number (whole number)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(log₂₆ n) time: one step per letter in the title, and O(log₂₆ n) space for the letters.',
  examples: [
    { label: 'Column 1', input: '1' },
    { label: 'Column 28', input: '28' },
    { label: 'Column 701', input: '701' },
  ],
}

export default function ExcelSheetColumnTitle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { work, title, digit } = step.snapshot
    return <>
      <p style={{ fontFamily: 'monospace' }}>Column number: {run.input}</p>
      <p style={{ fontFamily: 'monospace' }}>Remaining value: {work}</p>
      <div role="img" aria-label="Title letters" style={{ display: 'flex', gap: 6, minHeight: 48 }}>
        {(title || '·').split('').map((letter, i) => <div key={i} style={{
          minWidth: 44, padding: '8px 10px', boxSizing: 'border-box', textAlign: 'center', fontSize: 22, fontWeight: 700,
          border: '2px solid var(--border)', background: i === 0 && step.phase === 'letter' ? '#bbf7d0' : 'var(--surface2)', color: '#1c1917',
        }}>{title ? letter : ''}</div>)}
      </div>
      <p>{digit === null ? 'No letter chosen yet.' : `Remainder ${digit} selects ${String.fromCharCode(65 + digit)}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Shift by one:</strong> the sheet has no zero column, so subtracting one makes the remainder line up with A through Z.</p>
    <p><strong>Peel from the right:</strong> each remainder is the rightmost letter that is left; dividing by 26 moves to the next position.</p>
  </>} />
}
