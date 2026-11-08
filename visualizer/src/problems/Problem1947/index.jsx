import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1947',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with students and mentors, each row 0/1 answers (e.g. {"students":[[1,0],[0,1]],"mentors":[[1,1],[0,0]]})',
  url: 'https://leetcode.com/problems/maximum-compatibility-score-sum/',
  complexity: 'O(m! · m · n) for this depth-first search over complete pairings with m students and n questions. The visualization caps m at 4 and n at 6.',
  examples: [
    { label: 'Two pairs', input: '{"students":[[1,1,0],[1,0,1]],"mentors":[[1,0,0],[0,1,1]]}' },
    { label: 'Single pair', input: '{"students":[[0]],"mentors":[[0]]}' },
    { label: 'Identical students', input: '{"students":[[1,0],[1,0]],"mentors":[[1,0],[0,1]]}' },
    { label: 'Long run: four by six', input: '{"students":[[0,0,0,1,0,0],[1,1,1,1,0,0],[1,0,0,0,0,1],[0,1,1,0,0,0]],"mentors":[[0,0,0,0,1,1],[1,1,0,0,1,1],[1,1,0,0,1,0],[0,1,1,0,0,1]]}' },
  ],
}

export default function Problem1947Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const m = run.input.students.length
      const matrix = run.matrix
      return <>
        <table aria-label="Compatibility scores" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>student \ mentor</th>{Array.from({ length: m }, (_, j) => <th key={j}>M{j}</th>)}</tr></thead>
          <tbody>{matrix.map((row, i) => <tr key={i}><th>S{i}</th>{row.map((v, j) => {
            const chosen = step.pairing && step.pairing[i] === j
            const best = step.bestPairing && step.bestPairing[i] === j
            return <td key={j} style={{ width: 44, height: 36, textAlign: 'center', border: '1px solid var(--border)', background: best ? 'color-mix(in srgb, var(--success, #16a34a) 25%, var(--surface2))' : chosen ? 'color-mix(in srgb, var(--primary) 25%, var(--surface2))' : 'var(--surface2)' }}>{v}</td>
          })}</tr>)}</tbody>
        </table>
        <p>Blue cells: current pairing being tried. Green cells: best complete pairing so far.</p>
        <output aria-label="Best total">Best total: {step.best}</output>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
