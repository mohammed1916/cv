import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Keys', description: 'Collect each key the first time it appears.' },
    { id: 'sort', label: 'Sort', description: 'Sort the column names lexicographically.' },
    { id: 'fill', label: 'Fill rows', description: 'Put each object into one row, leaving empty cells for missing keys.' },
    { id: 'done', label: 'Matrix', description: 'The header row plus one row per object.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows: a list of at most 6 objects or arrays, possibly nested',
  url: 'https://leetcode.com/problems/array-of-objects-to-matrix/',
  complexity: 'O(total leaves) to flatten the items, then O(rows * columns) to fill the matrix, plus a sort of the column names.',
  examples: [
    { label: 'Two shared keys', input: '{"rows":[{"color":"red","size":2},{"size":5,"shape":"round"}]}' },
    { label: 'Only one object', input: '{"rows":[{"id":7,"ok":true}]}' },
    { label: 'Nested paths', input: '{"rows":[{"name":"Ada","address":{"city":"Oslo"}},[9,{"ok":false}]]}' },
    { label: 'Single empty object', input: '{"rows":[{}]}' },
    { label: 'Equal keys in both rows', input: '{"rows":[{"a":1,"b":2},{"a":1,"b":2}]}' },
    { label: 'Deepest nesting: 4 levels', input: '{"rows":[{"a":{"b":{"c":{"d":1}}}}]}' },
    { label: 'Long run: six mixed rows', input: '{"rows":[{"id":1,"tags":["x","y"]},[1,2,{"k":null}],{"a":{"b":true}},[[3]],{"name":"Ana","score":7},[false,"z"]]}' },
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
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>A dash marks a path the item does not have. Columns are sorted; nested paths are joined with dots.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
