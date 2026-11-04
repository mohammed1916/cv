import './PoolView.css'

// Each pool slot is a lane. A task is a bar from its start to its finish, so a free lane shows where the
// next waiting task will be placed. The vertical line is the current time.
export default function PoolView({ view }) {
  const total = Math.max(1, ...view.bars.map(b => b.finish))
  const pct = t => `${(t / total) * 100}%`
  const lanes = Array.from({ length: view.limit }, (_, slot) => slot)
  return <section className="pool-view" aria-label="Promise pool timeline">
    <div className="pool-view__axis" aria-hidden="true"><span>0</span><span>{`${total} ms`}</span></div>
    <div className="pool-view__lanes">
      {lanes.map(slot => <div key={slot} className="pool-view__lane">
        <span className="pool-view__slot">{`slot ${slot + 1}`}</span>
        <span className="pool-view__track">
          {view.bars.filter(b => b.slot === slot).map(b => <span key={b.index}
            className={`pool-view__bar${view.running.some(r => r.index === b.index) ? ' pool-view__bar--running' : ' pool-view__bar--done'}`}
            style={{ left: pct(b.start), width: pct(b.finish - b.start) }}>{`#${b.index}`}</span>)}
          <span className="pool-view__now" style={{ left: pct(view.now) }} />
        </span>
      </div>)}
    </div>
    <p className="pool-view__note">{view.running.length ? `${view.running.length} running now; the earliest finish frees a slot.` : 'Nothing is running.'}</p>
  </section>
}
