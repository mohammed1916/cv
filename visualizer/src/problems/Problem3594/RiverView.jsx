import RecordStateTable from '../../components/shared/RecordStateTable'

function Person({ id, time, onBoat }) {
  return <span data-person={id} style={{
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 42, padding: '3px 5px', borderRadius: 8, fontSize: 12,
    border: `2px solid ${onBoat ? 'var(--primary)' : 'var(--border)'}`, background: 'var(--surface)', color: 'var(--text)', fontWeight: onBoat ? 700 : 400,
  }}><strong>P{id}</strong><small>{time} min</small></span>
}

function Bank({ title, people, time, boarding }) {
  return <div aria-label={title} style={{ flex: '1 1 120px', minWidth: 0, padding: 8, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
    <strong style={{ display: 'block', marginBottom: 6 }}>{title}</strong>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 44 }}>
      {people.filter(p => !boarding.includes(p)).map(p => <Person key={p} id={p} time={time[p]} />)}
      {people.filter(p => !boarding.includes(p)).length === 0 && <em style={{ color: 'var(--text-muted)', fontSize: 12 }}>nobody</em>}
    </div>
  </div>
}

// The river itself: two banks, the boat on its side with whoever is rowing, and the direction it would travel.
function River({ run, step }) {
  const { n, time } = run.input
  const all = Array.from({ length: n }, (_, i) => i)
  const atCamp = all.filter(i => step.camp >> i & 1)
  const across = all.filter(i => !(step.camp >> i & 1))
  const crew = step.trip?.people ?? []
  const atLeft = step.side === 0
  return <div style={{ display: 'flex', gap: 6, alignItems: 'stretch', flexWrap: 'wrap' }}>
    <Bank title="Base camp" people={atCamp} time={time} boarding={crew} />
    <div aria-label="River" style={{ flex: '2 1 200px', minWidth: 0, padding: 8, borderRadius: 8, background: 'var(--surface3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: atLeft ? 'flex-start' : 'flex-end' }}>
        <div data-boat={atLeft ? 'camp' : 'far'} style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 8px', minHeight: 40, minWidth: 66, borderRadius: '6px 6px 22px 22px', border: '2px solid var(--primary)', background: 'var(--surface)', color: 'var(--text)' }}>
          {crew.length ? crew.map(p => <Person key={p} id={p} time={time[p]} onBoat />) : <small>empty boat</small>}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text)' }}>
        {crew.length > 0
          ? `${atLeft ? 'forward →' : '← back'} · takes ${step.trip.length.toFixed(2)} min`
          : step.camp === 0 ? 'everyone is across' : atLeft ? 'boat waits at camp' : 'boat waits at the far bank'}
      </div>
    </div>
    <Bank title="Far bank" people={across} time={time} boarding={crew} />
  </div>
}

function Stages({ mul, stage, nextStage }) {
  return <div aria-label="Stage cycle" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
    <strong style={{ marginRight: 4 }}>Stage multiplier</strong>
    {mul.map((x, j) => {
      const isNow = j === stage, isNext = j === nextStage
      return <span key={j} data-stage={j} data-role={isNow ? 'now' : isNext ? 'next' : ''} style={{
        padding: '3px 8px', borderRadius: 6, fontSize: 12, background: 'var(--surface2)', color: 'var(--text)',
        border: `2px ${isNext && !isNow ? 'dashed' : 'solid'} ${isNow ? 'var(--primary)' : isNext ? 'var(--success)' : 'var(--border)'}`, fontWeight: isNow ? 700 : 400,
      }}>[{j}] × {x}{isNow ? ' now' : ''}{isNext && !isNow ? ' next' : ''}{isNext && isNow ? ' again' : ''}</span>
    })}
  </div>
}

function Route({ route, routeIndex, mul }) {
  if (!route.length) return <p style={{ margin: 0, fontSize: 13 }}>Trips so far to reach this state: none.</p>
  return <div aria-label="Trips to reach this state">
    <strong style={{ fontSize: 13 }}>Trips to reach this state</strong>
    <ol style={{ margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {route.map((e, i) => <li key={i} style={{
        padding: '3px 7px', borderRadius: 6, fontSize: 12, background: 'var(--surface2)', color: 'var(--text)',
        border: `2px solid ${i === routeIndex ? 'var(--primary)' : i < routeIndex ? 'var(--success)' : 'var(--border)'}`,
      }}>{e.side === 0 ? '→' : '←'} P{e.people.join(', P')} · {e.slowest}×{mul[e.stage]} · at {e.arrival.toFixed(2)}</li>)}
    </ol>
  </div>
}

export default function RiverView({ run, step }) {
  const { mul } = run.input
  return <section aria-label="River crossing search" style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text)' }}>
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
      <span>Clock <strong>{step.t.toFixed(2)}</strong> min</span>
      <span>States finalized <strong>{step.settled}</strong></span>
      <span>States discovered <strong>{step.states}</strong></span>
    </div>
    <River run={run} step={step} />
    <Stages mul={mul} stage={step.stage} nextStage={step.trip?.nextStage} />
    <Route route={step.route} routeIndex={step.routeIndex} mul={mul} />
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 340px', minWidth: 0 }}>
        <RecordStateTable label="Trips from this state" columns={['group', 'length', 'next stage', 'arrives', 'outcome']} rows={step.options} activeRow={step.cursor} />
      </div>
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <RecordStateTable label={`Queue, earliest first (${step.queueRows.length} of ${step.queueSize})`} columns={['time', 'at camp', 'boat', 'stage']} rows={step.queueRows} activeRow={0} />
      </div>
    </div>
  </section>
}
