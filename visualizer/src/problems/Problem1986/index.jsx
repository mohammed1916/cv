import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1986',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Task durations and session length (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-work-sessions-to-finish-the-tasks/',
  complexity: 'O(2^n * n) time and O(2^n) space for n tasks (this visual caps n at 8).',
  examples: [
    { label: 'Three tasks', input: '{"tasks":[2,3,4],"sessionTime":5}' },
    { label: 'Mixed lengths', input: '{"tasks":[4,1,3,2,2],"sessionTime":6}' },
    { label: 'One session', input: '{"tasks":[1,1,2],"sessionTime":4}' },
  ],
}

export default function MinimumWorkSessions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { tasks, mask, value, inSet, full } = step.snapshot
    return <>
      <div aria-label="Tasks" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tasks.map((t, i) => {
          const inside = mask !== null && (mask & (1 << i)) !== 0
          return <span key={i} style={{
            border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--text)',
            background: inside ? 'var(--primary-glow)' : 'var(--surface2)',
          }}>task {i}: {t} h</span>
        })}
      </div>
      {mask !== null && <p>Current subset <strong>{inSet.length ? inSet.join(' + ') : 'empty'}</strong>: {value ? `${value[0]} session(s), ${value[1]} h in the last` : ''}</p>}
      <p>Subsets processed: <strong>{mask === null ? 0 : mask}</strong> of <strong>{full}</strong>. Each subset keeps the fewest sessions, then the least time in its last session.</p>
    </>
  }} renderReasoning={() => <p>A subset's best packing is built by removing one task at a time: the last task either fits in the open session or starts a new one.</p>} />
}
