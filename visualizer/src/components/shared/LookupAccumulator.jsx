import './LookupAccumulator.css';

/** Key/value cells with independent current and look-ahead reads. */
export function LookupMap({ entries, activeKey, nextKey, title = 'Lookup map' }) {
  return <section className="lookup-story" aria-label={title}>
    <h3>{title}</h3>
    <div className="lookup-map">{entries.map(({ key, value }, index) => <div key={key}
      className={`lookup-cell ${key === activeKey ? 'is-current' : ''} ${key === nextKey ? 'is-next' : ''}`}>
      <small>[{index}] {key === activeKey ? 'current' : ''} {key === nextKey ? 'look-ahead' : ''}</small>
      <strong>{key}</strong><span aria-hidden="true">↓</span><code>{value}</code>
    </div>)}</div>
  </section>;
}

/** Each segment is one completed algorithm contribution, including negative terms. */
export function AccumulationLane({ terms = [], result, title = 'Accumulation' }) {
  const scale = Math.max(1, ...terms.map(term => Math.abs(term.value)));
  return <section className="lookup-story" aria-label={title}>
    <h3>{title}</h3>
    <div className="accumulation-lane">{terms.length ? terms.map((term, index) => <div key={index}
      className={`accumulation-term ${term.value < 0 ? 'is-negative' : ''}`}>
      <strong>{term.label}</strong><span>{term.value >= 0 ? '+' : '−'}{Math.abs(term.value)}</span>
      <div className="accumulation-meter"><i style={{ width: `${Math.abs(term.value) / scale * 100}%` }} /></div>
    </div>) : <span>No contributions yet</span>}</div>
    <div className="accumulation-result"><span>{terms.map(term => `${term.value < 0 ? '−' : '+'} ${Math.abs(term.value)}`).join(' ') || '0'}</span><strong>= {result}</strong></div>
  </section>;
}
