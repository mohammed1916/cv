import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, inputLabel, complexity } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Playback":[{"session_id":1,"customer_id":1,"start_time":10,"end_time":20},{"session_id":2,"customer_id":1,"start_time":30,"end_time":40},{"session_id":3,"customer_id":2,"start_time":5,"end_time":15},{"session_id":4,"customer_id":2,"start_time":50,"end_time":60}],"Ads":[{"ad_id":1,"customer_id":1,"timestamp":25},{"ad_id":2,"customer_id":2,"timestamp":15},{"ad_id":3,"customer_id":1,"timestamp":40},{"ad_id":4,"customer_id":3,"timestamp":55}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity,
  examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

// Each session is a window on the time axis. Ads of the same customer are dots; an ad inside the window blocks the session.
function Windows({ input, current }) {
  const times = [...input.Playback.flatMap(s => [s.start_time, s.end_time]), ...input.Ads.map(a => a.timestamp)]
  const lo = Math.min(...times), hi = Math.max(...times, lo + 1)
  const pct = t => `${((t - lo) / (hi - lo)) * 100}%`
  return <div role="img" aria-label="Playback windows and ad times" style={{ display: 'grid', gap: 6, minWidth: 280 }}>
    {[...input.Playback].sort((a, b) => a.session_id - b.session_id).map(s => {
      const blocked = input.Ads.some(a => a.customer_id === s.customer_id && a.timestamp >= s.start_time && a.timestamp <= s.end_time)
      const isCurrent = current === s.session_id
      return <div key={s.session_id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>session {s.session_id}{isCurrent ? ' ◀' : ''}</span>
        <div style={{ position: 'relative', height: 26, borderBottom: '1px solid var(--border)' }}>
          <span style={{ position: 'absolute', top: 6, height: 12, left: pct(s.start_time), width: `${((s.end_time - s.start_time) / (hi - lo)) * 100}%`, borderRadius: 3,
            background: isCurrent ? 'var(--surface2)' : 'transparent', border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`, boxSizing: 'border-box' }} />
          {input.Ads.filter(a => a.customer_id === s.customer_id).map(a => {
            const inside = a.timestamp >= s.start_time && a.timestamp <= s.end_time
            return <span key={a.ad_id} title={`ad ${a.ad_id} at ${a.timestamp}`} style={{ position: 'absolute', top: 4, left: pct(a.timestamp), width: 10, height: 10, borderRadius: 999,
              transform: 'translateX(-5px)', background: inside && isCurrent ? 'var(--primary)' : 'var(--text-muted, var(--text))', opacity: blocked || !inside ? 1 : 0.6 }} />
          })}
        </div>
      </div>
    })}
    <span style={{ fontSize: 12, color: 'var(--text-muted, var(--text))' }}>Bars: playback windows. Dots: ads of the same customer. A dot inside its session's bar blocks it.</span>
  </div>
}

export default function AdFreeSessionsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.phase === 'check' ? step.rows[step.rows.length - 1].session_id : null
    return <>
      <Windows input={run.input} current={current} />
      <p style={{ margin: '10px 0 6px' }}>{step.message}</p>
      <table aria-label="Session checks" style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{step.columns.map(c => <th key={c} scope="col" style={CELL}>{c}</th>)}</tr></thead>
        <tbody>{step.rows.map((row, i) => <tr key={i} style={{ background: row.session_id === current ? 'var(--surface2)' : undefined }}>
          {step.columns.map(c => <td key={c} style={CELL}>{String(row[c] ?? '')}</td>)}
        </tr>)}</tbody>
      </table>
      <output aria-label="Query output" style={{ display: 'block', marginTop: 8 }}>{step.phase === 'done' ? `Output rows: ${run.result.length}` : ''}</output>
    </>
  }} renderReasoning={() => <>
    <p>A session is kept only when no ad from the same customer has a timestamp between its start and end, inclusive at both ends.</p>
    <p>Each check row shows the window test for one session, so you can see exactly which ad, if any, blocks it.</p>
  </>} />
}
