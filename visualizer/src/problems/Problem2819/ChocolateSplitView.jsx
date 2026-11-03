import './ChocolateSplitView.css'

// Each chocolate is a bar split at k: the lower part is Bob's payment, the upper part is Alice's.
export default function ChocolateSplitView({ run, step }) {
  const { prices, queries } = run.input
  const top = Math.max(...prices, 1)
  const k = step.k ?? queries[0][0]
  return <div className="chocolate-split">
    <div className="chocolate-split__bars" role="list" aria-label="Chocolate prices split at k">
      {prices.map((p, i) => {
        const bob = Math.min(p, k)
        const alice = p - bob
        const computed = step.values?.[i] !== undefined
        return <div key={i} role="listitem" className={`chocolate-split__bar${computed ? ' is-computed' : ''}${step.price === i ? ' is-active' : ''}`}
          aria-label={`price ${p}: Bob ${bob}, Alice ${alice}`}>
          <div className="chocolate-split__alice" style={{ height: `${(alice / top) * 100}%` }}><span>A{alice}</span></div>
          <div className="chocolate-split__bob" style={{ height: `${(bob / top) * 100}%` }}><span>B{bob}</span></div>
          <small>{p}</small>
        </div>
      })}
      <div className="chocolate-split__line" style={{ bottom: `${(k / top) * 100}%` }} aria-hidden="true"><span>k = {k}</span></div>
    </div>
    <div className="chocolate-split__values" aria-label="Sorted values">
      {(step.sorted || step.values || []).map((v, i) => <span key={i} className={`chocolate-split__chip${step.sorted && i < step.taken ? ' is-taken' : ''}`}>{v}</span>)}
    </div>
    <p className="chocolate-split__legend">Blue is Bob&apos;s share, amber is Alice&apos;s. Each chip is Bob minus Alice; highlighted chips are the m taken.</p>
    <output aria-label="Answers so far">{`query ${step.queryIndex >= 0 ? step.queryIndex + 1 : '-'} of ${queries.length} · m = ${step.m ?? '-'} · answers ${step.answers.join(', ') || 'none yet'}`}</output>
  </div>
}
