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
    { label: 'Single log', input: '{"ops":[["put",7,"2019:01:01:00:00:00"],["retrieve","2019:01:01:00:00:00","2019:01:01:00:00:00","Second"]]}' },
    { label: 'Equal stamps list ids in order', input: '{"ops":[["put",5,"2017:12:31:23:59:59"],["put",2,"2017:12:31:23:59:59"],["retrieve","2017:12:31:23:59:59","2017:12:31:23:59:59","Second"]]}' },
    { label: 'Extreme years', input: '{"ops":[["put",1,"0000:01:01:00:00:00"],["put",2,"9999:12:31:23:59:59"],["retrieve","0000:00:00:00:00:00","9999:99:99:99:99:99","Year"]]}' },
    { label: 'No match in range', input: '{"ops":[["put",1,"2020:01:01:00:00:00"],["retrieve","2021:01:01:00:00:00","2021:12:31:23:59:59","Year"]]}' },
    { label: 'Long run: 20 operations', input: '{"ops":[["put",1,"2010:12:25:04:39:27"],["put",2,"2010:09:27:03:51:50"],["put",3,"2024:01:25:22:39:52"],["put",4,"2012:10:19:13:10:39"],["put",5,"2019:07:17:19:50:42"],["put",6,"2020:04:25:22:05:30"],["put",7,"2022:08:06:10:01:29"],["put",8,"2024:07:19:18:30:49"],["put",9,"2029:07:09:03:36:45"],["put",10,"2019:06:19:14:08:06"],["put",11,"2018:02:16:15:25:23"],["put",12,"2025:10:15:16:08:48"],["put",13,"2023:01:09:08:45:30"],["put",14,"2013:01:19:03:06:51"],["put",15,"2012:02:26:04:49:56"],["put",16,"2016:08:11:13:41:45"],["put",17,"2023:11:15:16:25:03"],["put",18,"2018:07:09:01:13:46"],["put",19,"2023:08:17:07:55:53"],["retrieve","2015:01:01:00:00:00","2029:12:31:23:59:59","Month"]]}' },
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
