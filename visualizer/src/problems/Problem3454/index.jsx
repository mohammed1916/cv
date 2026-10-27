import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Edges', description: 'Collect the bottom and top edges of every square.' },
    { id: 'strip', label: 'Strip', description: 'Measure the union width of the squares covering this strip.' },
    { id: 'walk', label: 'Half reached', description: 'The running area first reaches half the total inside this strip.' },
    { id: 'done', label: 'Complete', description: 'Report the height of the separating line.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Squares (JSON object with squares as [x, y, side] triples, up to 6 squares)',
  url: 'https://leetcode.com/problems/separate-squares-ii/',
  complexity: 'O(n^2 log n) time for n squares with a strip per pair of edges. The visualization caps input at 6 squares.',
  examples: [
    { label: 'Two squares', input: '{"squares":[[0,0,1],[2,2,1]]}' },
    { label: 'Overlap', input: '{"squares":[[0,0,2],[1,1,1]]}' },
  ],
}

const cell = { padding: '4px 10px', textAlign: 'right', borderBottom: '1px solid var(--border, #ddd)' }

export default function SeparateSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Strips" style={{ borderCollapse: 'collapse' }}>
      <thead><tr>
        <th style={cell}>Strip</th><th style={cell}>Bottom</th><th style={cell}>Top</th><th style={cell}>Union width</th><th style={cell}>Area</th><th style={cell}>Area below</th>
      </tr></thead>
      <tbody>{step.strips.map((st, i) => {
        const before = step.strips.slice(0, i).reduce((sum, prior) => sum + prior.area, 0)
        const current = i === step.index
        return <tr key={i} style={current ? { background: 'rgba(250, 204, 21, 0.25)' } : undefined} aria-current={current ? 'step' : undefined}>
          <td style={cell}>{i + 1}</td><td style={cell}>{st.lo}</td><td style={cell}>{st.hi}</td><td style={cell}>{st.width}</td><td style={cell}>{st.area}</td><td style={cell}>{before}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Between two consecutive edge heights, the covered width stays the same, so the area below a line grows linearly inside each strip.</p>
    <p>Overlapping squares count once, so each strip uses the union of its x ranges. The answer is the height where the area below reaches half the total.</p>
  </>} />
}
