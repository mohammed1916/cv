import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1973',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Level-order JSON array with null for missing children (e.g. [10,4,6,2,2,null,null])',
  url: 'https://leetcode.com/problems/count-nodes-equal-to-sum-of-descendants/',
  complexity: 'O(n) time: each node is visited once in post-order. Space is the height of the tree.',
  examples: [
    { label: 'One match', input: '[10,4,6]' },
    { label: 'Deeper tree', input: '[10,4,6,2,2,null,null]' },
  ],
}

export default function Problem1973Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => {
      const roles = {}
      step.matches.forEach(id => { roles[id] = 'target' })
      if (step.focus !== null) roles[step.focus] = 'focus'
      return <>
        <RootedTreeDiagram root={step.tree} roles={roles} title="Tree (node ids inside the circles)" />
        <table aria-label="Node sums" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr><th>Node id</th><th>Subtree sum</th><th>Matches?</th></tr></thead>
          <tbody>{Object.keys(step.sums).map(id => <tr key={id} style={{ background: step.focus === Number(id) ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent' }}>
            <td>{id}</td><td>{step.sums[id]}</td><td>{step.matches.includes(Number(id)) ? 'yes' : ''}</td>
          </tr>)}</tbody>
        </table>
        <output aria-label="Matches">Matching nodes: {step.count}</output>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
