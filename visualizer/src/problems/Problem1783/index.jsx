import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Players and Championships tables'
const complexity = 'Reads each championship row once and adds four wins per row, so the work is linear in the number of rows. The visualizer caps each table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Players":[{"player_id":1,"player_name":"Alice"},{"player_id":2,"player_name":"Bob"},{"player_id":3,"player_name":"Cara"},{"player_id":4,"player_name":"Dan"},{"player_id":5,"player_name":"Eve"}],"Championships":[{"year":2019,"Wimbledon":1,"Fr_open":2,"US_open":3,"Au_open":4},{"year":2020,"Wimbledon":1,"Fr_open":4,"US_open":4,"Au_open":2},{"year":2021,"Wimbledon":2,"Fr_open":3,"US_open":1,"Au_open":1}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }
const TOURNAMENTS = ['Wimbledon', 'Fr_open', 'US_open', 'Au_open']

// The yearly results, with the year being stacked highlighted. Each winner id is one win in the stacked list.
function Championships({ rows, currentYear }) {
  return <table aria-label="Yearly championship results" style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{['year', ...TOURNAMENTS].map(c => <th key={c} scope="col" style={CELL}>{c}</th>)}</tr></thead>
    <tbody>{rows.map(row => <tr key={row.year} style={{ background: row.year === currentYear ? 'var(--surface2)' : undefined, fontWeight: row.year === currentYear ? 700 : 400 }}>
      {['year', ...TOURNAMENTS].map(c => <td key={c} style={CELL}>{row[c]}</td>)}
    </tr>)}</tbody>
  </table>
}

// Player win counts so far, as bars on a shared scale.
function Tally({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.grand_slams_count))
  if (rows.length === 0) return <p style={{ color: 'var(--text-muted, var(--text))' }}>No wins counted yet.</p>
  return <div role="img" aria-label="Wins per player so far" style={{ display: 'grid', gap: 6 }}>
    {rows.map(r => <div key={r.player_id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 30px', gap: 8, alignItems: 'center' }}>
      <span style={{ color: 'var(--text)' }}>{r.player_name}</span>
      <span style={{ height: 12, width: `${(r.grand_slams_count / max) * 100}%`, background: 'var(--primary)', borderRadius: 3 }} />
      <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{r.grand_slams_count}</span>
    </div>)}
  </div>
}

export default function GrandSlamVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const year = step.phase === 'tally' ? run.input.Championships[step.rows.length ? countYears(run, step) : 0]?.year : null
    return <>
      <p style={{ margin: '0 0 8px' }}>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <Championships rows={run.input.Championships} currentYear={year} />
        <div style={{ flex: '1 1 220px' }}>
          {step.phase === 'done'
            ? <table aria-label="Result" style={{ borderCollapse: 'collapse' }}>
              <thead><tr><th style={CELL}>player_id</th><th style={CELL}>player_name</th><th style={CELL}>grand_slams_count</th></tr></thead>
              <tbody>{step.rows.map(r => <tr key={r.player_id}><td style={CELL}>{r.player_id}</td><td style={CELL}>{r.player_name}</td><td style={CELL}>{r.grand_slams_count}</td></tr>)}</tbody>
            </table>
            : <Tally rows={step.phase === 'load' ? [] : step.rows} />}
        </div>
      </div>
    </>
  }} renderReasoning={() => <p>The four tournament columns are stacked into one list of winner ids, so every win counts once no matter which tournament it came from. Players who never appear in that list drop out of the join.</p>} />
}

// Number of championship years already stacked at this step, so the matching row can be highlighted.
function countYears(run, step) {
  const index = run.frames.indexOf(step)
  return run.frames.slice(0, index + 1).filter(f => f.phase === 'tally').length - 1
}
