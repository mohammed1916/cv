import RecordStateTable from '../../components/shared/RecordStateTable'

const chip = { minWidth: 34, padding: '4px 8px', borderRadius: 6, textAlign: 'center', border: '2px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }

const ROLE = {
  lowest: { borderColor: 'var(--warning)', fontWeight: 700 },
  overall: { borderColor: 'var(--warning)', fontWeight: 700, background: 'var(--surface2)', outline: '2px solid var(--warning)', outlineOffset: 1 },
  second: { borderColor: 'var(--primary)', fontWeight: 700 },
  gone: { borderStyle: 'dashed', color: 'var(--text-muted)', textDecoration: 'line-through', background: 'transparent' },
  received: { borderColor: 'var(--error)', background: 'var(--surface2)' },
}

const Unit = ({ value, role }) => <span data-unit={value} data-role={role || undefined} style={{ ...chip, ...(ROLE[role] || {}) }}>{value}</span>

// Every device as a row of units: what it keeps, what it sends, and what the sink collects.
export default function DeviceTransferView({ step }) {
  const received = step.sink === null ? [] : step.rows.flatMap((row, i) => (step.sent[i] ? [{ value: row[0], from: i }] : []))
  return <section aria-label="Devices and transfers" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ display: 'grid', gap: 8 }}>
      {step.rows.map((row, i) => {
        const isSink = i === step.sink
        const isSorted = step.sorted[i]
        return <article key={i} data-device={i} data-sink={isSink || undefined} style={{
          display: 'grid', gridTemplateColumns: 'minmax(84px, auto) 1fr minmax(84px, auto)', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
          border: `2px solid ${i === step.at ? 'var(--primary)' : isSink ? 'var(--error)' : 'var(--border)'}`, background: 'var(--surface)',
        }}>
          <strong>Device {i}{isSink ? <small style={{ display: 'block', fontWeight: 400, color: 'var(--text-muted)' }}>sink</small> : null}</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {row.map((value, k) => {
              let role = ''
              if (isSorted && k === 0) role = step.sent[i] ? 'gone' : i === step.lowestAt ? 'overall' : 'lowest'
              if (isSorted && k === 1) role = 'second'
              return <Unit key={k} value={value} role={role} />
            })}
            {step.sent[i] && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row[0]} sent to device {step.sink}</span>}
            {isSink && received.length > 0 && <>
              <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>+</span>
              {received.map(unit => <Unit key={unit.from} value={unit.value} role="received" />)}
            </>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>rating</small>
            <strong>{step.ratings[i] ?? '?'}</strong>
          </div>
        </article>
      })}
    </div>
    <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--text-muted)' }}>
      <span><Unit value="a" role="lowest" /> lowest in device</span>
      <span><Unit value="z" role="overall" /> lowest overall</span>
      <span><Unit value="b" role="second" /> next rating</span>
      <span><Unit value="c" role="gone" /> sent away</span>
      <span><Unit value="d" role="received" /> received by sink</span>
    </p>
    {step.candidates.length > 0 && <RecordStateTable label={`Cost of each device as sink (lowest unit is ${step.lowest})`}
      columns={['device', 'rating if unit leaves', 'rating as sink', 'loss']} rows={step.candidates} activeRow={step.sink ?? -1} />}
    <output aria-label="Running total" style={{ fontWeight: 600 }}>
      {step.check
        ? `Sum of second-lowest ${step.check.secondSum} − (${step.check.smallestSecond} − ${step.check.lowest}) = ${step.check.total}`
        : `Total so far: ${step.total ?? 'not started'}`}
    </output>
  </section>
}
