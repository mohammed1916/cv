const tint = (token, percent) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`
const TIER_TOKEN = { 'Tier 1': '--success', 'Tier 2': '--primary', 'Tier 3': '--warning' }
const cell = { padding: '4px 10px', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'left', whiteSpace: 'nowrap' }

// The source table feeds the points; the ladder shows positions and the two cutoff lines tiers come from.
export default function LeagueView({ step }) {
  return <section aria-label="League table and tier ladder" style={{ display: 'grid', gap: 16, color: 'var(--text)' }}>
    <SourceTable step={step} />
    <Ladder step={step} />
  </section>
}

function SourceTable({ step }) {
  return <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse' }}>
      <caption style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 700 }}>TeamStats</caption>
      <thead><tr>{['team_name', 'wins', 'draws', 'losses', '3 × wins + draws'].map(column => <th key={column} scope="col" style={{ ...cell, background: 'var(--surface3)' }}>{column}</th>)}</tr></thead>
      <tbody>{step.table.map((row, index) => {
        const active = index === step.at
        return <tr key={row.team_id} aria-current={active ? 'step' : undefined} style={{ outline: active ? '3px solid var(--primary)' : 'none', outlineOffset: -2 }}>
          <td style={cell}>{row.team_name}</td>
          <td style={{ ...cell, background: active ? tint('--primary', 18) : 'transparent' }}>{row.wins}</td>
          <td style={{ ...cell, background: active ? tint('--primary', 18) : 'transparent' }}>{row.draws}</td>
          <td style={{ ...cell, opacity: 0.55 }}>{row.losses}</td>
          <td style={{ ...cell, fontWeight: 700 }}>{row.points === null ? '—' : active ? `3 × ${row.wins} + ${row.draws} = ${row.points}` : row.points}</td>
        </tr>
      })}</tbody>
    </table>
  </div>
}

function Ladder({ step }) {
  const { ladder, cutOne, cutTwo } = step
  if (!ladder.length) return <p style={{ margin: 0, color: 'var(--text-muted)' }}>The ladder is built once every team has points.</p>
  const top = Math.max(1, ladder[0].points ?? 1)
  return <div>
    <h4 style={{ margin: '0 0 6px' }}>Ladder{cutOne !== null ? ` · ${ladder.length} teams, cutoffs at positions ${cutOne} and ${cutTwo}` : ''}</h4>
    <div role="list" style={{ display: 'grid', gap: 3, minWidth: 0 }}>
      {ladder.map((row, index) => {
        const next = ladder[index + 1]
        const token = TIER_TOKEN[row.tier]
        const active = index === step.ladderAt
        const lines = cutOne === null || !next || next.position === null || row.position === null ? [] : [[cutOne, 'Tier 1'], [cutTwo, 'Tier 2']]
          .filter(([cut]) => row.position <= cut && next.position > cut)
        return <div key={row.team_id} role="listitem">
          <div data-tier={row.tier ?? ''} aria-current={active ? 'step' : undefined} style={{ display: 'grid', gridTemplateColumns: '2.2em minmax(7em, 11em) minmax(40px, 1fr) 2.5em 5em', alignItems: 'center', gap: 8, padding: '3px 8px', borderRadius: 6, background: token ? tint(token, 14) : 'var(--surface2)', outline: active ? '3px solid var(--primary)' : 'none', outlineOffset: -1 }}>
            <strong>{row.position ?? '·'}</strong>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.team_name}</span>
            <span aria-hidden="true" style={{ height: 10, borderRadius: 5, background: 'var(--surface3)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${(row.points / top) * 100}%`, background: `var(${token ?? '--text-muted'})` }} />
            </span>
            <span style={{ textAlign: 'right' }}>{row.points}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{row.tier ?? ''}{row.pulledUp ? ' ↑' : ''}</span>
          </div>
          {lines.map(([cut, tier]) => <div key={tier} data-cutoff={cut} style={{ borderTop: '2px dashed var(--text-muted)', margin: '4px 0', paddingTop: 1, fontSize: 12, color: 'var(--text-muted)' }}>{tier} ends: positions up to {cut}</div>)}
        </div>
      })}
    </div>
    {ladder.some(row => row.pulledUp) && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>↑ This row is past the cutoff by count, but its position is shared with a team inside the tier.</p>}
  </div>
}
