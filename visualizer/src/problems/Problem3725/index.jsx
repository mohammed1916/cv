import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the sum over divisors.' },
    { id: 'skip', label: 'Skip', description: 'Mobius value zero: this divisor contributes nothing.' },
    { id: 'add', label: 'Add', description: 'Add mu(d) times the number of picks divisible by d.' },
    { id: 'done', label: 'Complete', description: 'Report the coprime count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with mat, for example {"mat":[[1,2],[3,4]]}',
  url: 'https://leetcode.com/problems/count-ways-to-choose-coprime-integers-from-rows/',
  complexity: 'O(V * (m * n + sqrt V)) time for largest value V. The visualization caps the matrix at 4 by 4.',
  examples: [
    { label: 'Example 1', input: '{"mat":[[1,2],[3,4]]}' },
    { label: 'Example 2', input: '{"mat":[[2,2],[2,2]]}' },
    { label: 'Single cell', input: '{"mat":[[7]]}' },
    { label: 'Equal entries', input: '{"mat":[[1,1,1],[1,1,1]]}' },
    { label: 'Extreme entries', input: '{"mat":[[150,1,150,1],[1,150,1,150],[150,1,150,1],[1,150,1,150]]}' },
    { label: 'Long run: 4 by 4 grid', input: '{"mat":[[53,90,77,112],[28,145,18,93],[3,50,5,74],[128,105,96,55]]}' },
  ],
}

export default function CoprimeRowChoices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Matrix with entries divisible by d" style={{ borderCollapse: 'collapse' }}>
      <tbody>{run.input.mat.map((row, r) => <tr key={r}>{row.map((v, c) => <td key={c} data-divisible={step.d && v % step.d === 0 ? 'yes' : undefined}
        style={{ border: '1px solid var(--surface2)', padding: '4px 8px', textAlign: 'center', color: 'var(--text)', background: step.d && v % step.d === 0 ? 'var(--primary)' : 'transparent' }}>{v}</td>)}</tr>)}</tbody>
    </table>
    <output aria-label="Divisor">{`d = ${step.d || '-'}, mu = ${step.mu}, picks divisible by d (product): ${step.ways}, running answer: ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Counting the picks with gcd exactly 1 directly is hard. Counting the picks where every chosen entry is divisible by d is easy: multiply the per-row counts.</p>
    <p>Mobius inversion turns those counts into exact counts by adding mu(d) times the count for each d.</p>
  </>} />
}
