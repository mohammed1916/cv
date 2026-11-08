import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'depth', label: 'Depth', description: 'Find the depth of each node from the root.' },
    { id: 'weight', label: 'Weight', description: 'Weight each node by the levels at or below its depth.' },
    { id: 'done', label: 'Complete', description: 'Report the weighted sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON object with parent and nums)',
  url: 'https://leetcode.doocs.org/en/lc/4015/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"parent":[-1,0,0,1,1,3],"nums":[2,4,1,3,5,6]}' },
    { label: 'Example 2', input: '{"parent":[-1,0,0],"nums":[7,1,2]}' },
    { label: "Single node", input: '{"parent":[-1],"nums":[5]}' },
    { label: "Equal values", input: '{"parent":[-1,0,0],"nums":[3,3,3]}' },
    { label: "Chain at the value limit", input: '{"parent":[-1,0,1,2,3,4,5,6,7,8,9,10],"nums":[1000000,1000000,1000000,1000000,1000000,1000000,1000000,1000000,1000000,1000000,1000000,1000000]}' },
    { label: "Long run: 12 nodes", input: '{"parent":[-1,0,0,2,1,1,4,6,7,8,2,5],"nums":[792479,544888,607956,325593,912569,428650,388448,910331,507754,294948,958930,943240]}' },
  ],
}

export default function WeightedSumOfTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Nodes">
    <thead><tr><th>Node</th><th>Parent</th><th>Depth</th><th>Value</th></tr></thead>
    <tbody>{run.input.parent.map((p, i) => <tr key={i} data-active={i === step.index ? 'true' : undefined}>
      <td>{i}</td><td>{p}</td><td>{step.depth[i] || '-'}</td><td>{run.input.nums[i]}</td>
    </tr>)}</tbody>
    <caption>{`Height ${step.height ?? 'not yet known'}, total ${step.total}`}</caption>
  </table>} renderReasoning={() => <>
    <p>A node at depth d carries its value times the number of levels from d down to the deepest level.</p>
    <p>Depths come from walking up to a node whose depth is already known.</p>
  </>} />
}
