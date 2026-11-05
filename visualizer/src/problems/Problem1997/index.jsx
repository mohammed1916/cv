import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1997',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nextVisit array (JSON), where nextVisit[i] is at most i',
  url: 'https://leetcode.com/problems/first-day-where-you-have-been-in-all-the-rooms/',
  complexity: 'O(n) time with prefix sums and O(n) space.',
  examples: [
    { label: 'Two rooms', input: '[0,0]' },
    { label: 'Four rooms', input: '[0,0,0,3]' },
    { label: 'Chain', input: '[0,1,1,2]' },
  ],
}

export default function FirstDayAllRooms() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nextVisit, room, dp, arrival, n } = step.snapshot
    return <>
      <div aria-label="Rooms and first arrival days" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: n }, (_, i) => <div key={i} style={{
          border: `${i === room ? 2 : 1}px solid ${i === room ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 6, padding: '4px 8px', minWidth: 70, color: 'var(--text)', fontFamily: 'monospace',
        }}>
          <div>room {i}</div>
          <small style={{ color: 'var(--text-muted)' }}>returns to {nextVisit[i]}</small>
          <div>first day: <strong>{arrival[i] ?? '-'}</strong></div>
          {i < n - 1 && <small style={{ color: 'var(--text-muted)' }}>cost {dp[i] ?? 0}</small>}
        </div>)}
      </div>
      <p>The cost of room {room ?? '-'} is the time spent leaving it for the first time, and each later first arrival is that cost after the previous one.</p>
    </>
  }} renderReasoning={() => <p>After a room's first visit, the walk must come back down to nextVisit[i] and climb again; that round trip costs the sum of the costs of the rooms in between, plus the two steps taken in room i.</p>} />
}
