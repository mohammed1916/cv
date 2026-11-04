import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'right', fontFamily: 'monospace' }
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Value range', description: 'The answer lies between 1 and m·n.' },
    { id: 'count', label: 'Count ≤ mid', description: 'Count products no larger than the midpoint.' },
    { id: 'done', label: 'Complete', description: 'The search has converged.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Table (JSON object with m, n and k)',
  url: 'https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/',
  complexity: 'O(m · log(m·n)) time and O(1) extra space.',
  examples: [
    { label: '3×3 fifth', input: '{"m":3,"n":3,"k":5}' },
    { label: '2×3 sixth', input: '{"m":2,"n":3,"k":6}' },
    { label: 'Large', input: '{"m":30,"n":30,"k":500}' },
  ],
}

export default function KthMultiplication() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { m, n, k } = run.input
    const hasMid = step.mid !== null && step.mid !== undefined
    return <>
      <AnswerRangeBar title="Candidate values" min={1} max={m * n} low={step.lo} high={step.hi}
        probe={hasMid ? step.mid : null} verdict={hasMid ? step.enough === true : null} />
      <output aria-label="Search state" style={{ display: 'block', color: 'var(--text)' }}>
        Range [{step.lo}, {step.hi}]{hasMid ? ` · mid ${step.mid} · ${step.count} products ≤ mid (k = ${k})` : ''}
      </output>
      {hasMid && <table aria-label="Products at most mid, per row" style={{ borderCollapse: 'collapse', marginTop: 8, color: 'var(--text)' }}>
        <thead><tr><th style={cell}>row i</th><th style={cell}>min(n, mid ÷ i)</th></tr></thead>
        <tbody>{Array.from({ length: Math.min(m, 12) }, (_, r) => r + 1).map(i => <tr key={i}>
          <td style={cell}>{i}</td><td style={cell}>{Math.min(n, Math.floor(step.mid / i))}</td>
        </tr>)}</tbody>
      </table>}
      {hasMid && m > 12 && <p style={{ color: 'var(--text)' }}>First 12 of {m} rows shown; the rest follow the same rule.</p>}
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Counting rule:</strong> row i (1-based) contributes min(n, ⌊mid / i⌋) products ≤ mid, so one division per row counts them all.</p>
    <p>The answer is the smallest v with at least {run.input.k} products ≤ v.</p>
  </>} />
}
