import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at (0, 0) with an odd next action.' },
    { id: 'settle', label: 'Settle', description: 'Take the cheapest unsettled state and expand it.' },
    { id: 'done', label: 'Complete', description: 'Reach the bottom right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with m, n and penalty)',
  url: 'https://leetcode.doocs.org/en/lc/4003/',
  complexity: 'O(mn log(mn)) time with a heap. The visualization caps the grid at 16 cells.',
  examples: [
    { label: 'Example 1', input: '{"m":2,"n":2,"penalty":[[5,3],[1,4]]}' },
    { label: 'Example 3', input: '{"m":2,"n":3,"penalty":[[2,6,1],[3,0,5]]}' },
    { label: "Two cells", input: '{"m":1,"n":2,"penalty":[[4,4]]}' },
    { label: "Tied penalties", input: '{"m":2,"n":2,"penalty":[[1,1],[1,1]]}' },
    { label: "Largest penalties in a checkerboard", input: '{"m":4,"n":4,"penalty":[[100000,0,100000,0],[0,100000,0,100000],[100000,0,100000,0],[0,100000,0,100000]]}' },
    { label: "Long run: 4 by 4 grid", input: '{"m":4,"n":4,"penalty":[[78744,36574,70675,84438],[85647,64886,91156,97699],[92550,93198,11636,10958],[99453,21508,32117,24218]]}' },
  ],
}

// The penalty grid with the cell being expanded marked; each cell shows its entry cost.
function PenaltyGrid({ run, current }) {
  return <table aria-label="Penalty grid">
    <tbody>{run.input.penalty.map((row, i) => <tr key={i}>{row.map((v, j) => {
      const isCurrent = current && current.i === i && current.j === j
      return <td key={j} data-active={isCurrent ? 'true' : undefined} style={{ textAlign: 'center', padding: 8, minWidth: 90, border: '1px solid var(--text-muted)', background: isCurrent ? 'var(--primary)' : 'var(--surface2)', color: isCurrent ? 'var(--surface)' : 'var(--text)' }}>
        <strong>{v}</strong><small> · entry {(i + 1) * (j + 1)}</small>
      </td>
    })}</tr>)}</tbody>
  </table>
}

export default function MinimumCostAlternatingPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PenaltyGrid run={run} current={step.phase === 'done' || step.phase === 'settle' || step.phase === 'start' ? step : null} />
    {step.settledList && <section aria-label="Settled states">
      <h3>Settled states, cheapest first</h3>
      <ol>{step.settledList.map((s, k) => <li key={k}>cell ({s.i}, {s.j}), next action {s.parity}: cost {s.cost}</li>)}</ol>
    </section>}
    <output aria-label="Current state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each move alternates between the right and down directions on odd actions and the left and up directions on even ones.</p>
    <p>Dijkstra runs over the pair of cell and next-action parity, so a wrong-way move or a wait is just another edge with a cost. The settled list shows states in the order they become final.</p>
  </>} />
}
