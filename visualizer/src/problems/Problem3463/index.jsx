import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Read the digits as the first row.' },
    { id: 'round', label: 'Round', description: 'Shrink the row by one digit.' },
    { id: 'pair', label: 'Pair', description: 'Combine two neighbours mod 10.' },
    { id: 'done', label: 'Compare', description: 'Compare the last two digits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a string of 3 to 12 digits',
  url: 'https://leetcode.com/problems/check-if-digits-are-equal-in-string-after-operations-ii/',
  complexity: 'Simulation takes O(n^2) time here because the visualization caps s at 12 digits. The full problem needs a faster counting method for long strings.',
  examples: [
    { label: 'Equal', input: '{"s":"9999"}' },
    { label: 'Different', input: '{"s":"5678"}' },
  ],
}

function rowsOf(s) {
  const rows = [[...s].map(Number)]
  while (rows[rows.length - 1].length > 2) {
    const last = rows[rows.length - 1]
    rows.push(last.slice(1).map((v, i) => (last[i] + v) % 10))
  }
  return rows
}

export default function CheckIfDigitsAreEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div aria-label="Every round of the reduction" style={{ display: 'grid', gap: 4, marginBottom: 8 }}>
      {rowsOf(run.input.s).map((row, round) => {
        const current = run.input.s.length - step.row.length
        return <div key={round} style={{ display: 'flex', gap: 6, color: 'var(--text)', fontWeight: round === current ? 700 : 400, opacity: round > current ? 0.45 : 1 }}>
          <span style={{ minWidth: 72 }}>{round === 0 ? 'digits' : `round ${round}`}</span>
          {row.map((v, i) => <span key={i} style={{ padding: '0 4px', background: round === current && step.at >= 0 && (i === step.at || i === step.at + 1) ? 'var(--primary)' : 'transparent' }}>{v}</span>)}
        </div>
      })}
    </div>
    <IndexedSequence label="Current row" length={step.row.length} valueAt={i => step.row[i]}
      active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.at >= 0 && i === step.at ? 'l' : step.at >= 0 && i === step.at + 1 ? 'r' : '')} />
    <output aria-label="Next row so far">{step.next.length ? step.next.join(' ') : 'not built yet'}</output>
  </>} renderReasoning={() => <>
    <p>Each round replaces every neighbouring pair with the sum of its digits modulo 10, so the row loses one digit per round.</p>
    <p>When two digits remain, the answer is simply whether they are equal. The visual shows each pair as it is combined.</p>
  </>} />
}
