import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '635',
  phases: [
    { id: 'start', label: 'Empty', description: 'No logs are stored.' },
    { id: 'put', label: 'Store', description: 'Append a log id with its timestamp.' },
    { id: 'retrieve', label: 'Retrieve', description: 'Cut each stamp to the granularity and compare.' },
    { id: 'done', label: 'Result', description: 'Report the last retrieved ids.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: put [id, stamp] or retrieve [start, end, granularity]',
  url: 'https://leetcode.com/problems/design-log-storage-system/',
  complexity: 'O(n) per retrieve, where n is the number of stored logs. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Day range', input: '{"ops":[["put",1,"2018:03:09:23:59:59"],["put",2,"2018:03:10:22:00:00"],["retrieve","2018:03:09:00:00:00","2018:03:10:23:59:59","Day"]]}' },
    { label: 'Hour range', input: '{"ops":[["put",3,"2016:07:14:10:05:00"],["put",4,"2016:07:14:12:00:00"],["retrieve","2016:07:14:10:00:00","2016:07:14:11:00:00","Hour"]]}' },
  ],
}

const UNITS = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second']
const cut = (stamp, idx) => stamp.split(':').slice(0, idx + 1).join(':')
const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'left' }

// Each stored log shown against the query window: its stamp, the stamp cut to the granularity, and whether it lands in range.
export default function DesignLogStorageSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const logs = step.logs || []
    const win = step.window
    const idx = win ? UNITS.indexOf(win.gran) : -1
    return <>
      {win && <p style={{ color: 'var(--text)' }}>
        Query window: from <code>{cut(win.start, idx)}</code> to <code>{cut(win.end, idx)}</code>, compared at {win.gran} granularity.
      </p>}
      {logs.length === 0 && <p style={{ color: 'var(--text)' }}>No logs are stored yet.</p>}
      {logs.length > 0 && <table aria-label="Stored logs against the query window" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>id</th><th style={cell}>stored stamp</th>{win && <th style={cell}>cut to {win.gran}</th>}{win && <th style={cell}>in range</th>}</tr></thead>
        <tbody>{logs.map(([id, ts]) => {
          const cutTs = win ? cut(ts, idx) : null
          const inRange = win ? cutTs >= cut(win.start, idx) && cutTs <= cut(win.end, idx) : null
          const matched = step.matched?.includes(id)
          return <tr key={id} data-log={id} style={{ background: matched ? 'var(--surface2)' : 'transparent' }}>
            <td style={cell}>{id}</td><td style={cell}>{ts}</td>
            {win && <td style={cell}>{cutTs}</td>}
            {win && <td style={cell}>{inRange ? 'yes' : 'no'}</td>}
          </tr>
        })}</tbody>
      </table>}
      <output aria-label="Current step" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each stamp is shortened to the chosen unit before the comparison, so a Day query ignores hours, minutes and seconds.</p>
    <p>Keeping the ids in insertion order means a query is one pass over the stored logs.</p>
  </>} />
}
