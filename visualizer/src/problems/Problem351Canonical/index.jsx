import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pattern has been counted yet.' },
    { id: 'extend', label: 'Extend', description: 'Add an unvisited key to the pattern.' },
    { id: 'blocked', label: 'Blocked', description: 'A key in the middle of the move is not visited yet.' },
    { id: 'count', label: 'Count', description: 'The pattern length is in range, so it counts.' },
    { id: 'done', label: 'Result', description: 'Every pattern in the length range is counted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with m and n (1 <= m <= n <= 4 in this view)',
  url: 'https://leetcode.com/problems/android-unlock-patterns/',
  complexity: 'Exponential in the worst case, but the visited mask keeps the search to valid patterns only. The visualization caps n at 4.',
  examples: [
    { label: 'Single keys', input: '{"m":1,"n":1}' },
    { label: 'Two keys', input: '{"m":1,"n":2}' },
    { label: 'Lengths three and four', input: '{"m":3,"n":4}' },
  ],
}

// Keypad layout: keys 1 to 9 in three rows.
function KeypadGrid({ path, blocked }) {
  const order = new Map(path.map((key, i) => [key, i + 1]))
  const current = path[path.length - 1]
  return <table aria-label="Keypad with the current pattern" style={{ borderCollapse: 'collapse', margin: '8px 0' }}>
    <tbody>{[0, 1, 2].map(row => <tr key={row}>{[0, 1, 2].map(col => {
      const key = row * 3 + col + 1
      const step = order.get(key)
      const isCurrent = key === current
      const isBlocked = key === blocked
      return <td key={key} data-key={key} style={{
        width: 48, height: 40, textAlign: 'center', color: 'var(--text)', border: '1px solid var(--text-muted)',
        background: isCurrent ? 'var(--primary)' : step ? 'var(--surface2)' : 'transparent',
        outline: isBlocked ? '2px dashed var(--warning)' : 'none',
      }}>
        <div>{key}</div>
        {step && <small>{step}</small>}
      </td>
    })}</tr>)}</tbody>
  </table>
}

export default function UnlockPatterns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <KeypadGrid path={step.path} blocked={step.blocked} />
    <output aria-label="Pattern state">{`${step.path.length ? `pattern ${step.path.join(' - ')}` : 'no pattern yet'} · counted ${step.total} of ${run.input.n} max length`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A move that jumps over a middle key is allowed only after that key is already in the pattern. Keys are never reused, so the visited set is all the state needed.</p>
  </>} />
}
