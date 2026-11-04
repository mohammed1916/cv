import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1405',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letter budgets as a JSON object',
  url: 'https://leetcode.com/problems/longest-happy-string/',
  complexity: 'O(n) rounds for n output letters, with a fixed three-letter check each round. O(n) extra space for the output.',
  examples: [
    { label: 'Balanced', input: '{"a": 2, "b": 2, "c": 1}' },
    { label: 'One dominant', input: '{"a": 1, "b": 1, "c": 7}' },
    { label: 'Single letter', input: '{"a": 0, "b": 0, "c": 4}' },
  ],
}

const tile = { minWidth: 34, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }
const LETTERS = ['a', 'b', 'c']

// One bar per letter: the filled part is the copies still available, the total is the starting budget.
function Budgets({ start, remaining, order = [], candidate = null }) {
  return <section aria-label="Remaining budgets" style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
    {LETTERS.map(letter => {
      const rank = order.indexOf(letter)
      const pct = start[letter] ? (remaining[letter] / start[letter]) * 100 : 0
      return <div key={letter} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px', gap: 8, alignItems: 'center', color: 'var(--text)' }}>
        <strong>{letter}</strong>
        <div role="img" aria-label={`${letter}: ${remaining[letter]} of ${start[letter]} left`} style={{ height: 14, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: candidate === letter ? 'var(--primary)' : 'var(--text)', opacity: 0.6 }} />
        </div>
        <small>{remaining[letter]} left{rank === 0 ? ' · first' : rank > 0 ? ` · rank ${rank + 1}` : ''}</small>
      </div>
    })}
  </section>
}

export default function LongestHappyString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { result, remaining, order, candidate } = step.snapshot
    const letters = [...result]
    return <>
      <Budgets start={run.input} remaining={remaining} order={order || []} candidate={candidate || null} />
      <div role="img" aria-label="Output so far" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40, marginBottom: 8 }}>
        {letters.map((letter, i) => {
          const inRun = i >= letters.length - 2 && letters.length >= 2 && letters[letters.length - 1] === letter && letters[letters.length - 2] === letter
          return <div key={i} style={{ ...tile, borderWidth: inRun ? 2 : 1, borderColor: inRun ? 'var(--primary)' : 'var(--border)' }}>{letter}</div>
        })}
        {letters.length === 0 && <span style={{ color: 'var(--text)' }}>Nothing appended yet.</span>}
      </div>
      <p style={{ color: 'var(--text)' }}>
        {order ? `Try order: ${order.join(' › ')}` : 'Start with the three budgets.'}
        {candidate ? ` · latest candidate ${candidate}` : ''}
      </p>
      <p style={{ color: 'var(--text)' }}>Two equal letters at the end of the string block a third copy of that letter. The letter that would start a new run is chosen instead.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Most copies first:</strong> the letter with the largest remaining budget is the one most at risk of running out, so it is tried first.</p>
    <p><strong>Break runs:</strong> when that letter would make three in a row, the next letter is used instead, which resets the run without wasting the big budget.</p>
  </>} />
}
