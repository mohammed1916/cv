import RecordStateTable from '../../components/shared/RecordStateTable'

const OUTPUT_COLUMNS = ['season_id', 'team_id', 'team_name', 'points', 'goal_difference', 'position']
const cell = { padding: '5px 9px', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'inherit', whiteSpace: 'nowrap' }
const signed = value => (value === null ? '' : value > 0 ? `+${value}` : String(value))

const used = (phase, column) => (phase === 'points' ? ['wins', 'draws', 'points'] : phase === 'difference' ? ['goals_for', 'goals_against', 'goal_difference'] : []).includes(column)

function SourceTable({ step }) {
  const columns = [['season_id', 'season'], ['team_name', 'team'], ['wins', 'W'], ['draws', 'D'], ['losses', 'L'], ['goals_for', 'GF'], ['goals_against', 'GA'], ['points', 'points'], ['goal_difference', 'GD']]
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="SeasonStats with computed columns" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, paddingBottom: 6 }}>SeasonStats, with the two computed columns</caption>
      <thead><tr>{columns.map(([key, label]) => <th key={key} scope="col" style={cell}>{label}</th>)}</tr></thead>
      <tbody>{step.table.map((row, i) => <tr key={i} data-row={i} style={{ background: i === step.at ? 'var(--surface3)' : 'var(--surface2)', boxShadow: i === step.at ? 'inset 4px 0 0 var(--primary)' : 'none' }}>
        {columns.map(([key]) => {
          const hot = i === step.at && used(step.phase, key)
          const value = key === 'goal_difference' ? signed(row[key]) : row[key]
          return <td key={key} data-used={hot || undefined} style={{ ...cell, fontWeight: hot ? 700 : 400, outline: hot ? '2px solid var(--primary)' : 'none', outlineOffset: -2 }}>{value ?? ''}</td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

function SeasonPanel({ season, step }) {
  const deciding = step.compare?.deciding
  return <article data-season={season.season_id} style={{ flex: '1 1 300px', minWidth: 0, border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--surface)' }}>
    <h4 style={{ margin: '0 0 6px', color: 'var(--text)' }}>Season {season.season_id}</h4>
    <div style={{ overflowX: 'auto' }}>
      <table aria-label={`Season ${season.season_id} standings`} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr>{['pos', 'team', 'points', 'GD'].map(name => <th key={name} scope="col" style={cell}>{name}</th>)}</tr></thead>
        <tbody>
          {season.order.length === 0 && <tr><td colSpan={4} style={{ ...cell, color: 'var(--text-muted)' }}>No team placed yet</td></tr>}
          {season.order.map(at => {
            const row = step.table[at]
            const role = at === step.at ? 'current' : at === step.other ? 'other' : ''
            const mark = key => (role && deciding === key ? { fontWeight: 700, outline: '2px solid var(--success)', outlineOffset: -2 } : {})
            return <tr key={at} data-team={row.team_name} data-role={role || undefined} style={{ background: role ? 'var(--surface3)' : 'transparent', boxShadow: role === 'current' ? 'inset 4px 0 0 var(--primary)' : role === 'other' ? 'inset 4px 0 0 var(--warning)' : 'none' }}>
              <td style={cell}>{row.position ?? '·'}</td>
              <td style={{ ...cell, ...mark('team_name') }}>{row.team_name}</td>
              <td style={{ ...cell, ...mark('points') }}>{row.points}</td>
              <td style={{ ...cell, ...mark('goal_difference') }}>{signed(row.goal_difference)}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
    {season.waiting.length > 0 && <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Waiting: {season.waiting.map(at => step.table[at].team_name).join(', ')}</p>}
  </article>
}

const RUNG = {
  tie: { label: 'tied, next rung', border: 'var(--border)', color: 'var(--text-muted)' },
  decides: { label: 'decides', border: 'var(--success)', color: 'var(--text)' },
  unused: { label: 'not needed', border: 'var(--border)', color: 'var(--text-muted)' },
}

function TieBreakLadder({ step }) {
  const { ladder, winner } = step.compare
  const teamA = step.table[step.at].team_name, teamB = step.table[step.other].team_name
  return <section aria-label="Tie-break ladder" style={{ color: 'var(--text)' }}>
    <h4 style={{ margin: '0 0 6px' }}>{teamA} against {teamB}</h4>
    <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
      {ladder.map(rung => <li key={rung.key} data-rung={rung.key} data-state={rung.state} style={{ flex: '1 1 150px', padding: '6px 10px', borderRadius: 8, border: `2px solid ${RUNG[rung.state].border}`, background: 'var(--surface2)', color: RUNG[rung.state].color, opacity: rung.state === 'unused' ? 0.7 : 1 }}>
        <strong style={{ display: 'block' }}>{rung.label}</strong>
        <span>{rung.a} vs {rung.b}</span>
        <small style={{ display: 'block' }}>{RUNG[rung.state].label}</small>
      </li>)}
    </ol>
    <p style={{ margin: '6px 0 0' }}>Ranked higher: <strong>{winner === 'a' ? teamA : teamB}</strong></p>
  </section>
}

const STAGES = [
  { label: 'WITH scored: points and goal difference', phases: ['load', 'points', 'difference'] },
  { label: 'RANK() OVER PARTITION BY season: position', phases: ['partition', 'compare', 'position'] },
  { label: 'ORDER BY season, position, name: output', phases: ['order', 'done'] },
]

// Stage strip: which part of the query the current step belongs to.
function StageStrip({ phase }) {
  const active = STAGES.findIndex(stage => stage.phases.includes(phase))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
    {STAGES.map((stage, i) => <li key={stage.label} data-stage={i} aria-current={i === active ? 'step' : undefined} style={{ flex: '1 1 200px', padding: '6px 10px', borderRadius: 8, border: `2px solid ${i === active ? 'var(--primary)' : 'var(--border)'}`, background: i === active ? 'var(--surface3)' : 'var(--surface2)', color: i <= active ? 'var(--text)' : 'var(--text-muted)', fontSize: 13 }}>
      {stage.label}
    </li>)}
  </ol>
}

// Three stages of the query: computed columns, one league table per season, then the sorted output.
export default function LeagueTableView({ step }) {
  return <section aria-label="League table ranking" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <StageStrip phase={step.phase} />
    {!step.seasons && <SourceTable step={step} />}
    {step.calc && <output aria-label="Current calculation" style={{ fontWeight: 600 }}>{step.table[step.at].team_name}: {step.calc}</output>}
    {step.seasons && !step.output && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{step.seasons.map(season => <SeasonPanel key={season.season_id} season={season} step={step} />)}</div>}
    {step.compare && <TieBreakLadder step={step} />}
    {step.output && <RecordStateTable label="Result" columns={OUTPUT_COLUMNS} rows={step.output} />}
  </section>
}
