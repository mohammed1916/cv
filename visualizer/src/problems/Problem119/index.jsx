import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

// Full triangle rows 0..level, shown so the viewer sees how the running row relates to the rows above it.
function triangleRows(level) {
  const rows = [[1]]
  for (let k = 1; k <= level; k++) {
    const prev = rows[k - 1]
    rows.push(Array.from({ length: k + 1 }, (_, j) => (j === 0 || j === k ? 1 : prev[j - 1] + prev[j])))
  }
  return rows
}

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Row index (integer from 0 to 33)',
  complexity: 'O(k²) time and O(k) extra space for row k, updating a single row in place.',
  examples: [
    { label: 'Row 0', input: '0' },
    { label: 'Row 3', input: '3' },
    { label: 'Row 4', input: '4' },
    { label: 'Row 10', input: '10' },
  ],
};

export default function PascalsTriangleIIVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    const updating = step.phase === 'update'
    return <>
      <IndexedSequence label={`Running row (level ${s.level})`} length={s.row.length} active={s.cell}
        valueAt={i => s.row[i]}
        roleAt={i => (updating && i === s.cell ? 'r (updating)' : updating && i === s.cell - 1 ? 'l (old value)' : '')} />
      <table aria-label="Triangle so far" style={{ borderCollapse: 'collapse', margin: '0.5rem auto' }}>
        <tbody>{triangleRows(Math.min(s.level, 12)).map((row, k) => <tr key={k}>
          <th scope="row" style={{ color: 'var(--text)', paddingRight: '0.5rem', fontWeight: 400 }}>{k}</th>
          {row.map((v, j) => <td key={j} style={{ padding: '0.2rem 0.45rem', textAlign: 'center', color: k === s.level ? 'var(--primary)' : 'var(--text)', fontWeight: k === s.level ? 700 : 400 }}>{v}</td>)}
        </tr>)}</tbody>
      </table>
      <p style={{ color: 'var(--text)' }}>{step.phase === 'done' ? `Final row ${run.input}` : `Building row ${s.level}`}</p>
    </>;
  }} renderReasoning={() => <>
    <p>Each entry in row k is the sum of two entries in row k − 1. Overwriting one row in place works because updates go from right to left, so each left neighbour still holds the previous row.</p>
    <p>Each new row starts with a 1 and ends with a 1; the update pass fills in the middle values.</p>
  </>} />;
}
