import './HashMapBucketsView.css'

// Ten bucket columns. The key's bucket is key mod 10; the bucket being searched is outlined and its chain is read top to bottom.
export default function HashMapBucketsView({ step }) {
  const current = step.bucket ?? -1
  const key = step.key
  return (
    <figure className="hb-view">
      <div className="hb-grid" role="list" aria-label="Hash buckets">
        {step.buckets.map((chain, i) => (
          <div role="listitem" key={i} className={i === current ? 'hb-col hb-col--now' : 'hb-col'}>
            <span className="hb-index">{i}</span>
            {chain.length ? chain.map((item, j) => <span key={`${item}-${j}`} className="hb-cell">{item}</span>) : <span className="hb-empty">·</span>}
          </div>
        ))}
      </div>
      <figcaption>
        {key === undefined || key === null ? 'Ten buckets, indexed 0 to 9. A key goes to bucket key mod 10.' : `Key ${key} goes to bucket ${key} mod 10 = ${current}.`}
        {step.returned !== null && step.returned !== undefined ? ` Returned ${String(step.returned)}.` : ''}
      </figcaption>
    </figure>
  )
}
