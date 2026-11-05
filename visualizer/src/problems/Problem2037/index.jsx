import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2037',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Seat and student positions (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-moves-to-seat-everyone/',
  complexity: 'O(n log n) time for the two sorts and O(n) for the pairing.',
  examples: [
    { label: 'Three students', input: '{"seats":[2,8,5],"students":[6,1,4]}' },
    { label: 'Repeated seats', input: '{"seats":[3,3],"students":[1,6]}' },
    { label: 'Single', input: '{"seats":[9],"students":[2]}' },
  ],
}

export default function MinimumMovesToSeatEveryone() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sortedSeats, sortedStudents, index, moves } = step.snapshot
    return <>
      <table aria-label="Sorted seats and students" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '2px 8px' }}>rank</th><th style={{ padding: '2px 8px' }}>student</th><th style={{ padding: '2px 8px' }}>seat</th><th style={{ padding: '2px 8px' }}>moves</th></tr></thead>
        <tbody>{sortedSeats.map((s, i) => <tr key={i} style={{ background: i === index ? 'var(--primary-glow)' : 'transparent' }}>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px', textAlign: 'center' }}>{i}</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px', textAlign: 'center' }}>{sortedStudents[i]}</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px', textAlign: 'center' }}>{s}</td>
          <td style={{ border: '1px solid var(--border)', padding: '2px 8px', textAlign: 'center' }}>{i <= index ? Math.abs(s - sortedStudents[i]) : ''}</td>
        </tr>)}</tbody>
      </table>
      <p>Total moves so far: <strong>{moves}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Matching sorted students with sorted seats means no two walks cross, and the total distance cannot be reduced by any other pairing.</p>} />
}
