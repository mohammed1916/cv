import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import examples from '../../config/examples/all-o1-data-structure'
import { parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Operations as JSON arrays (up to 200 for visualization)',
  url: 'https://leetcode.com/problems/all-oone-data-structure/',
  complexity: 'Average O(1) per data-structure operation; rendering each snapshot costs O(number of keys).',
  examples: examples.map(e => ({ label: e.label, input: JSON.stringify(e.operations) })),
  phases: [{id:'start',label:'Initialize'}, {id:'operation',label:'Update or query'}, {id:'done',label:'Complete'}],
}
export default function AllOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({step}) => <>
    <table><caption>Current key counts</caption><thead><tr><th>Key</th><th>Count</th></tr></thead>
      <tbody>{[...(step.map || [])].map(([key,count])=><tr key={key}><td>{key}</td><td>{count}</td></tr>)}</tbody></table>
    {Object.hasOwn(step, 'result') && <output>Query result: {JSON.stringify(step.result)}</output>}
    {!step.map?.size && <p>The data structure is empty.</p>}
  </>} renderReasoning={() => <p>A map finds each key’s count bucket. Updates move it to an adjacent count bucket; empty buckets are unlinked. The first and last buckets supply extreme keys. Any tied key is valid.</p>} />
}
