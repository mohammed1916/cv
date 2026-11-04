import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'With no events, every count is worth 0.' },
    { id: 'cell', label: 'Skip or attend', description: 'Compare skipping the event with attending it.' },
    { id: 'done', label: 'Complete', description: 'Report the best value for at most k events.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with events [[start, end, value], ...] and k',
  url: 'https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended-ii/',
  complexity: 'O(n * k) table cells after an O(n log n) sort. The visualization caps input at 8 events.',
  examples: [
    { label: 'Example 1', input: '{"events":[[1,2,4],[3,4,3],[2,3,1]],"k":2}' },
    { label: 'Example 2', input: '{"events":[[1,1,1],[2,2,2],[3,3,3],[4,4,4]],"k":3}' },
  ],
}

const DAY_WIDTH = 22

// Events drawn on a day axis. The current event is outlined; events that end before it starts (prev) are shaded,
// since those are the ones it can follow.
function DayAxis({ events, current, prevCount, lastDay }) {
  const days = Array.from({ length: lastDay }, (_, d) => d + 1)
  return <div role="img" aria-label="Events on a day axis" style={{ overflowX: 'auto', paddingBottom: 4 }}>
    <div style={{ position: 'relative', height: events.length * 22 + 26, width: lastDay * DAY_WIDTH + 40 }}>
      {days.map(d => <span key={d} style={{ position: 'absolute', left: (d - 1) * DAY_WIDTH + 40, top: 0, width: DAY_WIDTH, textAlign: 'center', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted, var(--text))' }}>{d}</span>)}
      {events.map((event, i) => {
        const [start, end, value] = event;
        const isCurrent = current === i + 1;
        const isPrev = current !== null && i < prevCount;
        return <div key={i} style={{ position: 'absolute', top: 22 + i * 22, left: 0, width: lastDay * DAY_WIDTH + 40, height: 18 }}>
          <span style={{ position: 'absolute', left: 0, width: 36, fontFamily: 'monospace', fontSize: 12, color: 'var(--text)' }}>#{i + 1}</span>
          <span title={`days ${start} to ${end}, value ${value}`} style={{
            position: 'absolute', left: 40 + (start - 1) * DAY_WIDTH, width: (end - start + 1) * DAY_WIDTH - 2, height: 18, boxSizing: 'border-box',
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 12,
            background: isCurrent ? 'var(--primary)' : isPrev ? 'var(--surface2)' : 'var(--surface)',
            color: isCurrent ? 'var(--on-primary, #fff)' : 'var(--text)',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
          }}>{value}</span>
        </div>
      })}
    </div>
  </div>
}

export default function MaxEventsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.phase === 'cell' ? step.i : null;
    const prevCount = current !== null ? step.prev[current] : 0;
    const lastDay = Math.max(...step.events.map(e => e[1]), 1);
    return <>
      <DayAxis events={step.events} current={current} prevCount={prevCount} lastDay={lastDay} />
      {current !== null && <p style={{ margin: '6px 0', color: 'var(--text)' }}>Event {current} can follow the first {prevCount} events (shaded), those that end before it starts.</p>}
      <table aria-label="dp table of best values" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <caption style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 4 }}>dp[i][j]: best value using the first i events (sorted by end) with at most j attended</caption>
        <thead><tr><th scope="col" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>i \ j</th>{Array.from({ length: run.input.k + 1 }, (_, j) => <th scope="col" key={j} style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>{j}</th>)}</tr></thead>
        <tbody>{step.table.map((row, i) => <tr key={i}>
          <th scope="row" style={{ border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace', padding: '2px 6px', textAlign: 'left' }}>{i === 0 ? '0 (none)' : `${i} ${step.events[i - 1].join('-')}`}</th>
          {row.map((value, j) => <td key={j} style={{ border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'center', padding: '2px 8px', fontFamily: 'monospace',
            background: i === step.i && j === step.j ? 'var(--primary)' : undefined, color: i === step.i && j === step.j ? 'var(--on-primary, #fff)' : 'var(--text)' }}>{value}</td>)}
        </tr>)}</tbody>
      </table>
      <output aria-label="Step" style={{ display: 'block', marginTop: 8 }}>{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Sorting by end day lets each event look back to the last event that ends before it starts.</p>
    <p>Two events conflict when one starts on or before the other ends, so an attended event must start after the previous one ends.</p>
  </>} />
}
