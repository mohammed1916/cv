import { useState } from 'react'

// Keep index gaps and value slopes visible; page long witnesses without losing nodes.
export default function SubsequencePath({ values, indices, minGap }) {
  const [page, setPage] = useState(0)
  const pageSize = 16, lastPage = Math.max(0, Math.ceil(indices.length / pageSize) - 1)
  const current = Math.min(page, lastPage), start = current * pageSize
  // Include the preceding point so the boundary edge remains inspectable.
  const shown = indices.slice(Math.max(0, start - 1), start + pageSize)
  const low = Math.min(...shown.map(i => values[i])), high = Math.max(...shown.map(i => values[i]))
  const y = index => 125 - 85 * (values[index] - low) / Math.max(1, high - low)
  return <section className="algorithm-path" aria-label="Optimal subsequence path">
    <h3>Optimal subsequence: value slopes and original index gaps</h3>
    <div className="algorithm-path__viewport" tabIndex={0} role="region" aria-label="Scrollable subsequence diagram">
      <svg width={Math.max(200, shown.length * 110)} height={190} role="img" aria-label={`Selected indices ${shown.join(', ')}; required gap ${minGap}`}>
        {shown.map((index, offset) => <g key={index}>
          {offset > 0 && <>
            <line x1={(offset - 1) * 110 + 50} y1={y(shown[offset - 1])} x2={offset * 110 + 50} y2={y(index)} stroke="currentColor" strokeWidth={2} />
            <text x={offset * 110} y={165} textAnchor="middle" fill="currentColor" fontSize={11}>gap {index - shown[offset - 1]}</text>
          </>}
          <circle cx={offset * 110 + 50} cy={y(index)} r={6} fill="var(--primary)" />
          <text x={offset * 110 + 50} y={y(index) - 12} textAnchor="middle" fill="currentColor" fontSize={12}>{values[index]}</text>
          <text x={offset * 110 + 50} y={185} textAnchor="middle" fill="currentColor" fontSize={11}>[{index}]</text>
        </g>)}
      </svg>
    </div>
    {lastPage > 0 && <nav aria-label="Subsequence pages">
      <button disabled={current === 0} onClick={() => setPage(current - 1)}>Previous path page</button>
      <span>Page {current + 1} / {lastPage + 1} · {indices.length} selected indices</span>
      <button disabled={current === lastPage} onClick={() => setPage(current + 1)}>Next path page</button>
    </nav>}
  </section>
}
