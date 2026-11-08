import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Points', description: 'Sort the cuts and add the two ends.' },
    { id: 'length', label: 'Gap', description: 'Move to stretches spanning one more step.' },
    { id: 'try', label: 'Try cut', description: 'Try each cut inside the stretch as the first one made.' },
    { id: 'keep', label: 'Keep', description: 'Store the cheapest way to cut this stretch.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (stick length) and cuts (positions, JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/',
  complexity: 'O(m^3) time for m cut points including the ends. The visualization caps n at 20 and cuts at 6.',
  examples: [
    { label: 'Own case 1', input: '{"n":8,"cuts":[2,4,5,6]}' },
    { label: 'Own case 2', input: '{"n":10,"cuts":[6,7,2,5,3]}' },
    { label: 'Smallest stick', input: '{"n":2,"cuts":[1]}' },
    { label: 'Symmetric cuts', input: '{"n":8,"cuts":[2,6]}' },
    { label: 'Largest: 6 cuts near the end', input: '{"n":20,"cuts":[19,17,13,11,7,2]}' },
    { label: 'Long run: 6 cuts on 20', input: '{"n":20,"cuts":[13,7,6,16,10,8]}' },
  ],
}

export default function MinimumCostToCutStick() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const m = step.pts.length
    const [li, rj] = step.cell ?? [-1, -1]
    return <>
      <section aria-label="Stick points with the stretch l to r">
        <h3>The stick: points in order, with the stretch l to r being solved</h3>
        <div role="img" aria-label="Stick points" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {step.pts.map((p, idx) => {
            const inside = li >= 0 && idx >= li && idx <= rj
            const cutHere = step.apex === idx
            return <div key={idx} data-point={idx} style={{
              minWidth: 46, padding: '4px 6px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
              border: `${idx === li || idx === rj || cutHere ? 2 : 1}px solid ${cutHere ? 'var(--primary, var(--text))' : idx === li || idx === rj ? 'var(--text)' : 'var(--border)'}`,
              background: inside ? 'var(--surface2)' : 'transparent', opacity: li >= 0 && !inside ? 0.5 : 1,
            }}>
              <div>{p}</div>
              <small style={{ display: 'block', height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                {idx === li ? 'l' : ''}{idx === rj ? 'r' : ''}{cutHere ? ' k' : ''}
              </small>
            </div>
          })}
        </div>
      </section>
      <table aria-label="Best cost for each stretch">
        <thead><tr><th>from \ to</th>{step.pts.map((p, j) => <th key={j}>{p}</th>)}</tr></thead>
        <tbody>{step.best.map((row, i) => <tr key={i}><th>{step.pts[i]}</th>{row.map((v, j) => {
          const current = step.cell && step.cell[0] === i && step.cell[1] === j
          return <td key={j} data-role={current ? 'active' : undefined}>{j > i && j < m ? v : ''}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Current cut">{step.apex === -1 ? 'No cut in use' : `Cut at ${step.pts[step.apex]} for stretch ${step.pts[step.cell[0]]} to ${step.pts[step.cell[1]]}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each cut splits a stretch into two smaller stretches, and the cost of that cut is the length of the stretch being cut. The first cut made in a stretch decides the two sub-problems.</p>
    <p>Stretches are solved from short to long, so the best cost for each piece is ready before any larger stretch uses it.</p>
  </>} />
}
