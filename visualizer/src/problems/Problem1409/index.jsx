import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1409',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Permutation size and queries (JSON object)',
  url: 'https://leetcode.com/problems/queries-on-a-permutation-with-key/',
  complexity: 'O(m * q) time for q queries over m values, because each query searches and reshuffles the list.',
  examples: [
    { label: 'Move-to-front', input: '{"m":5,"queries":[3,1,2,1]}' },
    { label: 'Repeat one', input: '{"m":4,"queries":[4,4,4]}' },
    { label: 'Single item', input: '{"m":1,"queries":[1]}' },
  ],
}

export default function QueriesOnPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { perm, query, position } = step.snapshot
    return <>
      <p>{query === null ? 'No query is being looked up.' : `Looking up ${query}, found at position ${position}.`}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {perm.map((v, i) => <div key={v} style={{
          padding: '8px 12px', borderRadius: 6, fontFamily: 'monospace',
          border: '2px solid', borderColor: v === query ? '#0891b2' : '#94a3b8',
          fontWeight: v === query ? 700 : 400,
        }}><div>{v}</div><small>pos {i}</small></div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Positions are read before the move.</strong> Each answer is the zero-based index of the value at the moment its query arrives.</p>
    <p><strong>Moves change later answers.</strong> Moving a value to the front pushes earlier entries one slot right, so later lookups see the shifted list.</p>
  </>} />
}
