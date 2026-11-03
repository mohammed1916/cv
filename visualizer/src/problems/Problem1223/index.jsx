import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and rollMax (JSON)',
  complexity: 'O(n * 6 * maximum limit) time, using run-length rows for each face.',
  examples: [
    { label: 'Different limits', input: '{"n":9,"rollMax":[1,3,2,4,2,3]}' },
    { label: 'One roll', input: '{"n":1,"rollMax":[1,2,3,4,5,6]}' },
    { label: 'Limit one', input: '{"n":6,"rollMax":[1,1,1,1,1,1]}' },
    { label: 'Loose limits', input: '{"n":4,"rollMax":[5,5,5,5,5,5]}' },
  ],
}

const FACES = [1, 2, 3, 4, 5, 6]

export default function DiceRollSimulation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { runs, length, total } = step.snapshot
    const width = Math.max(...runs.map(row => row.length - 1))
    return <div aria-label="Run lengths" style={{ display: 'grid', gap: 4, fontFamily: 'monospace', overflowX: 'auto' }}>
      <div>Sequences of {length} rolls: {total}</div>
      <table>
        <thead><tr><th>Face</th>{Array.from({ length: width }, (_, k) => <th key={k}>run {k + 1}</th>)}</tr></thead>
        <tbody>
          {runs.map((row, f) => <tr key={FACES[f]} data-face={FACES[f]}>
            <th>{FACES[f]}</th>
            {Array.from({ length: width }, (_, k) => <td key={k} style={{ padding: '2px 8px', textAlign: 'right' }}>{row[k + 1] ?? ''}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
