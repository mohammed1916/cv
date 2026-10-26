import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty map', description: 'No keys stored yet.' },
    { id: 'insert', label: 'Insert', description: 'Store or overwrite a key.' },
    { id: 'sum', label: 'Prefix sum', description: 'Add the values whose keys start with the prefix.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/map-sum-pairs/',
  complexity: 'O(n) per sum in this scan version. A trie keyed by characters gives O(L) per insert and sum, plus the stored prefix totals.',
  examples: [
    { label: 'Example', input: '[["insert","apple",3],["sum","ap"],["insert","app",2],["insert","apple",2],["sum","ap"]]' },
    { label: 'No match', input: '[["insert","a",1],["sum","b"]]' },
  ],
}

export default function MapSumPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <OperationLog title="Operations" ops={step.ops} current={step.ops.length - 1} />
    <table aria-label="Stored keys">
      <thead><tr><th>Key</th><th>Value</th></tr></thead>
      <tbody>{step.map.length === 0 ? <tr><td colSpan={2}>empty</td></tr> : step.map.map(([k, v]) => <tr key={k} style={{ fontWeight: step.matches?.includes(k) ? 700 : 400 }}><td>{k}</td><td>{v}</td></tr>)}</tbody>
    </table>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Overwrite rule:</strong> inserting an existing key replaces its value rather than adding a second entry.</p>
  </>} />
}
