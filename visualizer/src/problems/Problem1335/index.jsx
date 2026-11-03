import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1335',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with jobDifficulty and d (JSON)',
  url: 'https://leetcode.com/problems/minimum-difficulty-of-a-job-schedule/',
  complexity: 'O(d · n²) time and O(n) extra space: each day tries every block start for every prefix length.',
  examples: [
    { label: 'Descending', input: '{"jobDifficulty":[6,5,4,3,2,1],"d":2}' },
    { label: 'Spikes', input: '{"jobDifficulty":[1,9,1,9,1],"d":3}' },
    { label: 'Too many days', input: '{"jobDifficulty":[4,2],"d":3}' },
  ],
}

const cellStyle = { minWidth: 44, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)' }

export default function MinDifficultySchedule() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { jobs, day, previous, current, start, end } = step.snapshot
    const inBlock = i => start !== undefined && i >= start && i < end
    return <>
      <div role="img" aria-label="Job difficulties" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {jobs.map((value, i) => <div key={i} data-index={i} style={{ ...cellStyle, background: inBlock(i) ? '#bfdbfe' : 'transparent', color: '#1c1917' }}>
          <div>{value}</div><small>job {i + 1}</small>
        </div>)}
      </div>
      <p>{day ? `Day ${day} of the schedule.` : 'Before any day is placed.'}</p>
      <table aria-label="Cost table" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>jobs</th><th>previous days</th><th>this day</th></tr></thead>
        <tbody>{previous.map((cost, k) => <tr key={k}>
          <td style={cellStyle}>{k}</td>
          <td style={cellStyle}>{cost ?? '∞'}</td>
          <td style={cellStyle}>{current ? (current[k] ?? '∞') : '·'}</td>
        </tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Layers of days:</strong> the table for one more day is built from the table for one fewer day. Each entry asks where the last day block starts.</p>
    <p><strong>Cost of a block:</strong> a day pays only the hardest job in it, so extending a block to the left can only raise its cost.</p>
    <p>{step.snapshot.result !== undefined ? `Final answer: ${step.snapshot.result}.` : 'Keep scanning block starts for the current prefix.'}</p>
  </>} />
}
