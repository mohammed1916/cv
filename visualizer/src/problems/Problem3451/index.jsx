import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with a logs list (log_id, ip, status_code)',
  url: 'https://leetcode.com/problems/find-invalid-ip-addresses/description/',
  complexity: 'O(n) checks for n rows, then a count per distinct invalid ip. The octet rules are a knowledge-derived teaching version.',
  examples: [
    { label: 'Example', input: '{"logs":[{"log_id":1,"ip":"192.168.1.1","status_code":200},{"log_id":2,"ip":"256.1.1.1","status_code":404},{"log_id":3,"ip":"1.2.3","status_code":500},{"log_id":4,"ip":"01.2.3.4","status_code":200},{"log_id":5,"ip":"256.1.1.1","status_code":500},{"log_id":6,"ip":"a.b.c.d","status_code":200}]}' },
    { label: 'All valid', input: '{"logs":[{"log_id":1,"ip":"8.8.8.8","status_code":200}]}' },
    { label: 'Single log', input: '{"logs":[{"log_id":9,"ip":"10.0.0.1","status_code":500}]}' },
    { label: 'Same address tie', input: '{"logs":[{"log_id":1,"ip":"8.8.8.8","status_code":200},{"log_id":2,"ip":"8.8.8.8","status_code":404}]}' },
    { label: 'Edge addresses and codes', input: '{"logs":[{"log_id":1,"ip":"0.0.0.0","status_code":100},{"log_id":2,"ip":"255.255.255.255","status_code":599}]}' },
    { label: 'Long run: 12 logs', input: '{"logs":[{"log_id":1,"ip":"67.211.3.248","status_code":301},{"log_id":2,"ip":"9.118.128.254","status_code":404},{"log_id":3,"ip":"208.24.254.5","status_code":200},{"log_id":4,"ip":"150.187.124.11","status_code":404},{"log_id":5,"ip":"92.94.249.18","status_code":200},{"log_id":6,"ip":"34.0.119.24","status_code":301},{"log_id":7,"ip":"233.163.245.31","status_code":200},{"log_id":8,"ip":"175.69.115.37","status_code":404},{"log_id":9,"ip":"117.232.240.43","status_code":301},{"log_id":10,"ip":"60.139.110.50","status_code":301},{"log_id":11,"ip":"2.45.236.56","status_code":404},{"log_id":12,"ip":"200.208.106.63","status_code":404}]}' },
  ],
}

export default function Problem3451() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Working rows</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result">{`Invalid ips listed: ${run.result.length}`}</output>
  </>} renderReasoning={() => <>
    <p>An ip is checked against four rules: exactly four octets, numeric octets, no leading zero, and no octet above 255. The status code plays no part.</p>
    <p>Invalid rows are counted per ip, then sorted by count descending and ip ascending.</p>
  </>} />
}
