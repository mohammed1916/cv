import RecordStateTable from '../../components/shared/RecordStateTable'

const SOURCE_COLUMNS = ['id', 'country', 'points', 'winery']
const TOTAL_COLUMNS = ['country', 'winery', 'total']
const OUTPUT_COLUMNS = ['country', 'top_winery', 'second_winery', 'third_winery']

// One board per country: bar length is the winery's total, and only places 1 to 3 reach the output.
function CountryBoard({ board, isActive, activePlace }) {
  const top = Math.max(1, ...board.ranked.map(entry => Math.abs(entry.total)))
  return <article data-country={board.country} data-active={isActive ? 'true' : undefined}
    style={{ flex: '1 1 210px', minWidth: 0, border: `${isActive ? 2 : 1}px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, padding: 8, background: 'var(--surface2)' }}>
    <strong>{board.country}</strong>
    <ol style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'grid', gap: 4 }}>
      {board.ranked.map(entry => {
        const cut = entry.place > 3
        const lit = isActive && activePlace === entry.place
        return <li key={entry.winery} data-place={entry.place} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 6, alignItems: 'center', opacity: cut ? 0.5 : 1 }}>
          <span aria-label={`Place ${entry.place}`} style={{ textAlign: 'center', fontWeight: 700, borderRadius: 4, background: lit ? 'var(--primary)' : 'transparent', color: lit ? 'var(--text-inverse)' : 'var(--text)' }}>{entry.place}</span>
          <div style={{ position: 'relative', minWidth: 0, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, width: `${(Math.abs(entry.total) / top) * 100}%`, borderRadius: 3, background: `color-mix(in srgb, ${cut ? 'var(--text-dim)' : 'var(--primary)'} 22%, transparent)` }} />
            <span style={{ position: 'relative', display: 'block', padding: '2px 6px', overflowWrap: 'anywhere', textDecoration: cut ? 'line-through' : 'none' }}>{entry.label}</span>
          </div>
        </li>
      })}
      {[2, 3].filter(place => place > board.ranked.length).map(place => {
        const lit = isActive && activePlace === place
        return <li key={place} data-place={place} data-empty="true" style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 6, alignItems: 'center' }}>
          <span style={{ textAlign: 'center', fontWeight: 700, borderRadius: 4, background: lit ? 'var(--primary)' : 'transparent', color: lit ? 'var(--text-inverse)' : 'var(--text-muted)' }}>{place}</span>
          <span style={{ padding: '2px 6px', border: '1px dashed var(--border)', borderRadius: 4, color: 'var(--text-muted)' }}>empty place</span>
        </li>
      })}
    </ol>
  </article>
}

export default function WineryPipelineView({ run, step }) {
  return <section aria-label="Winery query state" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <RecordStateTable label="1. Wineries (source rows)" columns={SOURCE_COLUMNS} rows={run.input.Wineries} activeRow={step.sourceRow} />
      </div>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <RecordStateTable label="2. totals (grouped)" columns={TOTAL_COLUMNS} rows={step.totals} activeRow={step.totalRow} />
        {step.added !== null && <p style={{ margin: '4px 0 0', fontWeight: 600 }}>+{step.added} points added this step</p>}
      </div>
    </div>
    <section aria-label="Ranking by country">
      <strong>3. ranked (one board per country; places 4 and below are cut)</strong>
      {step.boards.length
        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {step.boards.map(board => <CountryBoard key={board.country} board={board} isActive={board.country === step.activeCountry} activePlace={step.activePlace} />)}
        </div>
        : <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>Boards appear once every row has been summed.</p>}
    </section>
    <RecordStateTable label="4. Result (one row per country)" columns={OUTPUT_COLUMNS} rows={step.output} activeRow={step.outputRow} />
    {step.activeColumn && <output aria-label="Column being filled" style={{ fontWeight: 600 }}>Filling {step.activeColumn} for {step.activeCountry}</output>}
  </section>
}
