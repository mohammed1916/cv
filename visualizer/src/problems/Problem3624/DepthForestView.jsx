import FenwickView from '../../components/shared/FenwickView'
import OperationLog from '../../components/shared/OperationLog'

const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, var(--surface2))`

function DepthChain({ chain, label }) {
  const popcountOf = x => x.toString(2).split('').filter(b => b === '1').length
  return <section aria-label="Popcount chain" style={{ padding: 8, marginBottom: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)' }}>
    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>{label}</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {chain.map((value, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span data-chain-value={value} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 13 }}>
          <strong>{value}</strong>
          <code style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{value.toString(2)}</code>
        </span>
        {i < chain.length - 1 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{`${popcountOf(value)} ones →`}</span>}
      </span>)}
      <strong style={{ marginLeft: 6 }}>depth {chain.length - 1}</strong>
    </div>
  </section>
}

// The array with each entry's depth, the popcount chain in play, all six trees as rows, and the active tree in detail.
export default function DepthForestView({ step }) {
  const { nums, depths, trees, activeTree, ops, range, k, focus, chain, chainAt, prefixes, log, queryIndex } = step
  const touched = new Set(ops.flatMap(op => op.chain))
  const inRange = i => range && i >= range[0] && i <= range[1]
  const opsThrough = queryIndex < 0 ? (step.phase === 'done' ? log.length - 1 : -1) : queryIndex
  return <section aria-label="Popcount depth state" style={{ color: 'var(--text)' }}>
    {chain && <DepthChain chain={chain} label={`Depth of the value for position ${chainAt}`} />}
    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Array with depths</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
      {nums.map((value, i) => {
        const match = range && inRange(i) && depths[i] === k
        return <div key={i} data-index={i} data-depth={depths[i]} data-match={match ? 'yes' : undefined} style={{
          minWidth: 52, padding: '3px 5px', textAlign: 'center', borderRadius: 6, fontSize: 12, wordBreak: 'break-all',
          border: `2px solid ${i === focus ? 'var(--primary)' : inRange(i) ? 'var(--text-muted)' : 'var(--border)'}`,
          background: match ? tint('var(--success)', 40) : 'var(--surface2)',
          opacity: range && !inRange(i) ? 0.55 : 1,
        }}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>[{i}]</small>
          <strong>{value}</strong>
          <span style={{ display: 'block' }}>{depths[i] === null ? 'depth ?' : `depth ${depths[i]}`}</span>
        </div>
      })}
    </div>
    <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>One tree per depth</h3>
    <div style={{ overflowX: 'auto', marginBottom: 10 }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12 }} aria-label="Fenwick cells for each depth">
        <thead><tr><th style={{ padding: '2px 6px', textAlign: 'left' }}>depth</th>{nums.map((_, i) => <th key={i} style={{ padding: '2px 6px', color: 'var(--text-muted)', fontWeight: 400 }}>{i + 1}</th>)}</tr></thead>
        <tbody>{trees.map((tree, d) => <tr key={d} data-tree={d} data-active={d === activeTree} style={{ opacity: activeTree === null || d === activeTree ? 1 : 0.55 }}>
          <th scope="row" style={{ padding: '2px 6px', textAlign: 'left', color: d === activeTree ? 'var(--primary)' : 'var(--text)' }}>{d}</th>
          {tree.map((value, c) => <td key={c} style={{
            padding: '2px 8px', textAlign: 'center', border: '1px solid var(--border)',
            background: d === activeTree && touched.has(c + 1) ? tint('var(--primary)', 45) : 'var(--surface2)',
          }}>{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {prefixes && <p aria-label="Prefix subtraction" style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>
      {`prefix up to r = ${prefixes.upper}`}{prefixes.lower !== null ? ` − prefix before l = ${prefixes.lower} = ${prefixes.upper - prefixes.lower}` : ''}
    </p>}
    {activeTree !== null && <FenwickView tree={trees[activeTree]} ops={ops} title={`Tree for depth ${activeTree}`} />}
    <OperationLog title="Queries" ops={log} current={queryIndex} through={opsThrough} />
    <output aria-label="Answers" style={{ display: 'block', fontWeight: 700 }}>{`answers = ${JSON.stringify(step.answers)}`}</output>
  </section>
}
