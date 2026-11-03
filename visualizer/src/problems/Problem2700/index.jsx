import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top level.' },
    { id: 'differ', label: 'Differ', description: 'A leaf value changed.' },
    { id: 'done', label: 'Result', description: 'Report every changed key.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with obj1 and obj2 (nested plain objects)',
  url: 'https://leetcode.com/problems/differences-between-two-objects/',
  complexity: 'O(total keys) comparisons when values are small. Nested objects are visited once each.',
  examples: [
    { label: 'Nested change', input: '{"obj1":{"a":1,"n":{"x":2,"y":[1]}},"obj2":{"a":1,"n":{"x":5,"y":[1]}}}' },
    { label: 'Added key', input: '{"obj1":{},"obj2":{"k":null}}' },
  ],
}

export default function DifferencesBetweenTwoObjects() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Changed keys">
      <thead><tr><th>Key</th><th>Old</th><th>New</th></tr></thead>
      <tbody>{Object.entries(step.diff).map(([key, [oldValue, newValue]]) => <tr key={key}>
        <td>{key}</td><td>{JSON.stringify(oldValue) ?? 'missing'}</td><td>{JSON.stringify(newValue) ?? 'missing'}</td>
      </tr>)}</tbody>
    </table>
    {Object.keys(step.diff).length === 0 && <p>No differences yet.</p>}
  </>} renderReasoning={() => <>
    <p>Recursion only continues when both sides are objects. Anywhere else the two values are compared as a whole.</p>
    <p>Each changed key is reported with its old and new value, which is why the result is a map from key path to a pair.</p>
  </>} />
}
