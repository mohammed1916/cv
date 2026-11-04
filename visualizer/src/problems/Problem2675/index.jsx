import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Keys', description: 'Collect each key the first time it appears.' },
    { id: 'fill', label: 'Fill rows', description: 'Put each object into one row, leaving empty cells for missing keys.' },
    { id: 'done', label: 'Matrix', description: 'The header row plus one row per object.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with rows: a list of at most 6 flat objects',
  url: 'https://leetcode.com/problems/array-of-objects-to-matrix/',
  complexity: 'O(rows * keys) to build the matrix. Each key is looked up once per row.',
  examples: [
    { label: 'Two shared keys', input: '{"rows":[{"color":"red","size":2},{"size":5,"shape":"round"}]}' },
    { label: 'Only one object', input: '{"rows":[{"id":7,"ok":true}]}' },
  ],
}

export default function ArrayOfObjectsToMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    // The matrix is shown as it is built: the header row first, then one row per object filled so far.
    const matrix = step.matrix.length ? step.matrix : [step.header]
    return <section aria-label="Matrix being built" style={{ display: 'grid', gap: 8 }}>
      <table>
        <thead><tr>{step.header.map(key => <th key={key} scope="col">{key}</th>)}</tr></thead>
        <tbody>
          {matrix.slice(1).map((row, r) => <tr key={r} style={{ background: r === matrix.length - 2 ? 'var(--primary-glow)' : undefined }}>
            {step.header.map((key, c) => <td key={key} style={{ color: 'var(--text)' }}>{row[c] === '' ? '—' : JSON.stringify(row[c])}</td>)}
          </tr>)}
        </tbody>
      </table>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>A dash marks a key the object does not have.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
