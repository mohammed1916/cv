import RecordStateTable from '../../components/shared/RecordStateTable'
import { COLUMNS, REPORT_COLUMNS } from './algorithm'

const W = 560
const minutes = stamp => Number(stamp.slice(0, 2)) + Number(stamp.slice(3)) / 60
const tone = score => (score > 0 ? 'var(--success)' : 'var(--error)')

function Timeline({ joined, at }) {
  const H = 62
  const x = stamp => 14 + minutes(stamp) / 90 * (W - 28)
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block' }} role="img" aria-label="Match timeline with the 45:00 boundary">
    <text x={14} y={13} fontSize="11" fill="var(--text-muted)">half 1: up to 45:00</text>
    <text x={W - 14} y={13} fontSize="11" fill="var(--text-muted)" textAnchor="end">half 2: from 45:01</text>
    <line x1={14} x2={W - 14} y1={36} y2={36} stroke="var(--border)" strokeWidth="3" />
    <line x1={W / 2} x2={W / 2} y1={20} y2={52} stroke="var(--text)" strokeDasharray="4 3" />
    <text x={W / 2} y={60} fontSize="10" fill="var(--text)" textAnchor="middle">45:00</text>
    {joined.map((row, i) => <g key={i} data-pass={i}>
      <circle cx={x(row.time_stamp)} cy={36} r={i === at ? 8 : 5} fill={row.score === undefined ? 'var(--surface2)' : tone(row.score)} stroke={i === at ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={i === at ? 3 : 1} />
    </g>)}
  </svg>
}

function Pitch({ teams, row }) {
  const names = [...new Set(teams.map(t => t.team_name))].sort()
  const H = Math.max(150, 40 + Math.max(...names.map(name => teams.filter(t => t.team_name === name).length), 1) * 42)
  const place = new Map()
  names.forEach((name, side) => {
    const squad = teams.filter(t => t.team_name === name)
    squad.forEach((player, i) => place.set(player.player_id, { x: side === 0 ? W * 0.25 : W * 0.75, y: 44 + (i + 0.5) * ((H - 52) / squad.length) }))
  })
  const from = row && row.from_team !== undefined ? place.get(row.pass_from) : null
  const to = row && row.to_team !== undefined ? place.get(row.pass_to) : null
  const stroke = row?.score !== undefined ? tone(row.score) : 'var(--primary)'
  const mid = from && to ? { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) + Math.abs(from.y - to.y) / 2 } : null
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block' }} role="img" aria-label="Players by team with the current pass">
    <defs><marker id="p3384-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={stroke} /></marker></defs>
    <rect x={1} y={1} width={W - 2} height={H - 2} rx={8} fill="var(--surface2)" stroke="var(--border)" />
    {names.length > 1 && <line x1={W / 2} x2={W / 2} y1={1} y2={H - 1} stroke="var(--border)" strokeDasharray="6 4" />}
    {names.map((name, side) => <text key={name} x={side === 0 ? W * 0.25 : W * 0.75} y={22} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">{name}</text>)}
    {from && to && row.pass_from !== row.pass_to && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={stroke} strokeWidth="3" markerEnd="url(#p3384-head)" />}
    {mid && row.score !== undefined && <text x={mid.x} y={mid.y - 8} textAnchor="middle" fontSize="15" fontWeight="700" fill={stroke}>{row.score > 0 ? '+1 kept' : '-1 intercepted'}</text>}
    {teams.map(player => {
      const p = place.get(player.player_id)
      const isFrom = from && player.player_id === row.pass_from
      const isTo = to && player.player_id === row.pass_to
      return <g key={player.player_id} data-player={player.player_id}>
        <circle cx={p.x} cy={p.y} r={16} fill="var(--surface)" stroke={isFrom || isTo ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={isFrom || isTo ? 3 : 1} />
        <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--text)">{player.player_id}</text>
        {isFrom && <text x={p.x - 22} y={p.y + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">from</text>}
        {isTo && <text x={p.x + 22} y={p.y + 4} fontSize="11" fill="var(--text-muted)">to</text>}
      </g>
    })}
  </svg>
}

function Scoreboard({ teams, groups, touched }) {
  const names = [...new Set(teams.map(t => t.team_name))].sort()
  const cell = { padding: '6px 12px', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'center' }
  return <table style={{ borderCollapse: 'collapse' }} aria-label="Running dominance by team and half">
    <caption style={{ textAlign: 'left', fontWeight: 600, padding: '6px 0', color: 'var(--text)' }}>Groups so far</caption>
    <thead><tr><th scope="col" style={cell}>team</th><th scope="col" style={cell}>half 1</th><th scope="col" style={cell}>half 2</th></tr></thead>
    <tbody>{names.map(name => <tr key={name}>
      <th scope="row" style={cell}>{name}</th>
      {[1, 2].map(half => {
        const key = `${name}|${half}`
        const value = groups[key]
        return <td key={half} data-group={key} style={{ ...cell, outline: touched === key ? '2px solid var(--primary)' : 'none', outlineOffset: -2, fontWeight: touched === key ? 700 : 400, color: value === undefined ? 'var(--text-muted)' : 'var(--text)' }}>{value === undefined ? 'no row' : value > 0 ? `+${value}` : value}</td>
      })}
    </tr>)}</tbody>
  </table>
}

// The join is drawn as a pass on a pitch; crossing the midline is exactly the "different team" test.
export default function PassBoardView({ run, step }) {
  const row = step.at >= 0 ? step.joined[step.at] : null
  return <section aria-label="Pass board" style={{ color: 'var(--text)', display: 'grid', gap: 12 }}>
    <Timeline joined={step.joined} at={step.at} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 320px', minWidth: 0 }}><Pitch teams={run.input.teams} row={row} /></div>
      <Scoreboard teams={run.input.teams} groups={step.groups} touched={step.touched} />
    </div>
    <RecordStateTable label="Passes joined to both team names" columns={COLUMNS} rows={step.joined} activeRow={step.at} />
    {step.report.length > 0 && <RecordStateTable label="Report, ordered by team then half" columns={REPORT_COLUMNS} rows={step.report} />}
    <output aria-label="Output rows" style={{ color: 'var(--text)' }}>{step.phase === 'done' ? `Output rows: ${run.result.length}` : `Passes scored: ${step.joined.filter(p => p.score !== undefined).length} of ${step.joined.length}`}</output>
  </section>
}
