const cellStyle = (active, inWindow, blocked) => ({
  width: 52, height: 48, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  border: `2px solid ${active ? '#0f766e' : inWindow ? '#67e8f9' : 'var(--border, #cbd5e1)'}`,
  background: blocked ? 'repeating-linear-gradient(45deg, #e2e8f0 0 6px, #cbd5e1 6px 12px)' : active ? '#ccfbf1' : inWindow ? '#ecfeff' : 'transparent',
  borderRadius: 6, fontVariantNumeric: 'tabular-nums', fontSize: 14, margin: 2,
})

const arrayRowStyle = { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 6 }

function ArrayRow({ label, values, window, activeCol, highlight }) {
  return (
    <div style={arrayRowStyle}>
      <span style={{ minWidth: 150, fontSize: 13 }}>{label}</span>
      {values.map((value, col) => {
        const inWindow = window && col >= window.lo && col < window.hi
        const self = window && window.self !== undefined && col === window.col
        return (
          <span key={col} data-col={col} style={{
            minWidth: 44, textAlign: 'center', padding: '4px 6px', borderRadius: 4,
            border: `1px solid ${col === activeCol ? '#0f766e' : inWindow ? '#67e8f9' : 'var(--border, #cbd5e1)'}`,
            background: col === activeCol ? '#ccfbf1' : inWindow && highlight ? '#ecfeff' : 'transparent',
            fontWeight: self ? 700 : 400,
          }}>
            {value}{self ? ' (self)' : ''}
          </span>
        )
      })}
    </div>
  )
}

export default function RouteGridView({ run, step }) {
  const rows = step.table.length
  const cols = step.table[0].length
  const { window: win } = step
  const activeRow = step.cell?.row ?? step.row
  const isActiveCell = (r, c) => step.cell && step.cell.row === r && step.cell.col === c
  const inWindowCell = (r, c) => win && r === win.row && c >= win.lo && c < win.hi && !(win.kind === 'sideways' && c === win.col)

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}>
        Vertical reach = floor(sqrt(d² − 1)) = <strong>{step.reach}</strong> column{step.reach === 1 ? '' : 's'} for d = {step.d}.
        Sideways reach = d = <strong>{step.d}</strong> columns, within one row only.
      </p>
      <div role="grid" aria-label="Route counts per cell" style={{ marginBottom: 8 }}>
        {step.table.map((line, r) => (
          <div key={r} role="row" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 28, fontSize: 12 }}>{r}</span>
            {line.map((value, c) => {
              const blocked = value === '#'
              const shown = value === '#' ? '#' : value === null ? '-' : value
              return (
                <span key={c} role="gridcell" data-cell={`${r},${c}`} style={cellStyle(isActiveCell(r, c), inWindowCell(r, c), blocked)}>
                  <span>{shown}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>[{r},{c}]</span>
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <div aria-label="Current row arrays" style={{ marginTop: 8 }}>
        <ArrayRow label={`arrivals, row ${activeRow}`} values={step.arrivals} window={win?.kind === 'sideways' ? win : null} activeCol={step.cell?.col} highlight />
        <ArrayRow label="sideways (this row)" values={step.sideways} window={null} activeCol={step.cell?.col} />
        <ArrayRow label="both (arrive + side)" values={step.both} window={win?.kind === 'step' ? win : null} activeCol={null} highlight />
        <ArrayRow label="next arrivals (row above)" values={step.nextArrivals} window={null} activeCol={step.cell?.col} />
      </div>
      {win && (
        <p role="note" style={{ fontSize: 14 }}>
          {win.kind === 'sideways'
            ? `Sideways window: arrivals in columns ${win.lo}..${win.hi - 1} sum to ${win.windowSum}; subtract the cell's own ${win.self} arrival(s) to get ${win.value}. Sideways counts are not summed again, so no sideways move follows another.`
            : `Vertical window from row ${win.row} to row ${win.targetRow}: both-counts in columns ${win.lo}..${win.hi - 1} sum to ${win.windowSum}, giving ${win.value} arrivals in the cell above.`}
        </p>
      )}
      <output aria-label="Route count" style={{ display: 'block', fontWeight: 600 }}>
        {`d = ${run.input.d}; ${step.phase === 'done' ? `answer ${step.result}` : `answer so far not final; final answer ${run.result}`}`}
      </output>
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        Solver auxiliary space is O(columns) per row for the prefix, sideways and next arrays. The trace also stores a full grid snapshot and copies of those arrays for every frame, which is O({rows} x {cols}) per frame here.
      </p>
    </div>
  )
}
