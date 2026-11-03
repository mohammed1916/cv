import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Collect keys', description: 'Gather every key the first time it appears.' },
    { id: 'fill', label: 'Fill rows', description: 'Read each object under the header keys.' },
    { id: 'done', label: 'Result', description: 'The matrix is complete.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with rows (a list of flat objects, at most 6)',
  url: 'https://leetcode.com/problems/array-of-objects-to-matrix/',
  complexity: 'O(r * k) time for r objects and k distinct keys, plus the key scan.',
  examples: [
    { label: 'Ragged keys', input: '{"rows":[{"id":1,"name":"Ada"},{"id":2,"email":"x"}]}' },
    { label: 'Empty list', input: '{"rows":[]}' },
  ],
}

export default function ArrayOfObjectsToMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Matrix">
      <tbody>
        {step.matrix.map((row, r) => <tr key={r}>
          {row.map((cell, c) => <td key={c} style={{ border: '1px solid currentColor', padding: '4px 8px', minWidth: 48 }}>
            {r === 0 ? <strong>{cell}</strong> : cell === '' ? <span aria-label="empty">-</span> : String(cell)}
          </td>)}
        </tr>)}
      </tbody>
    </table>
    <p>{step.header.length ? `Header so far: ${step.header.join(', ')}` : 'No header yet.'}</p>
  </>} renderReasoning={() => <>
    <p>The header is built in one pass over the objects, keeping the first-seen order. Each later pass just looks up its own values.</p>
    <p>A key that is absent from an object leaves an empty cell instead of an error.</p>
  </>} />
}
