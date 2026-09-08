import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import InducedGraph from '../../components/shared/InducedGraph'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Node values and edges (JSON object)',
  url: 'https://leetcode.com/problems/count-connected-subgraphs-with-even-node-sum/',
  complexity: 'O(2ⁿ × (n + edges)) time. The solver uses O(n + edges) working space; the visualization retains O(n × 2ⁿ) compact traversal frames. The official limit is 13 nodes.',
  phases: [
    { id: 'start', label: 'Input graph', description: 'Prepare adjacency lists.' },
    { id: 'select', label: 'Select subset', description: 'Keep the subset and its induced edges.' },
    { id: 'visit', label: 'Traverse', description: 'Visit reachable selected nodes only.' },
    { id: 'decide', label: 'Count / reject', description: 'Require even parity and connectivity.' },
    { id: 'done', label: 'Complete', description: 'Return the count over all non-empty subsets.' },
  ],
  examples: [
    { label: 'Three-node path', input: '{"nums":[1,0,1],"edges":[[0,1],[1,2]]}' },
    { label: 'Odd singleton', input: '{"nums":[1],"edges":[]}' },
    { label: 'Disconnected zeros', input: '{"nums":[0,0,0],"edges":[]}' },
    { label: 'Even triangle', input: '{"nums":[0,0,0],"edges":[[0,1],[0,2],[1,2]]}' },
  ],
}

export default function EvenConnectedSubgraphs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>Subset mask: {step.mask.toString(2).padStart(run.input.length, '0')} (rightmost bit = node 0). {step.phase === 'done' ? 'All subsets processed.' : `Sum: ${step.sum}.`}</p>
    <InducedGraph values={run.input} edges={run.edges} mask={step.mask} reached={step.reached} active={step.node} />
    <IndexedSequence label="Node selection and reachability" length={run.input.length} active={step.node} valueAt={i => run.input[i]}
      roleAt={i => step.reached & (1 << i) ? 'reached' : step.mask & (1 << i) ? 'selected' : 'excluded'} />
    <output aria-label="Connected even subset count">{step.phase === 'done' ? 'Final count' : 'Count so far'}: {step.total}</output>
    {step.phase === 'done' && <IndexedSequence label="All subset decisions (mask = index + 1)" length={run.decisions.length} indexOffset={1}
      valueAt={i => run.decisions[i].counted ? 'counted' : 'rejected'}
      roleAt={i => run.decisions[i].sum % 2 ? 'odd sum' : run.decisions[i].connected ? 'even + connected' : 'disconnected'} />}
  </>} renderReasoning={({ step }) => <>
    <p>Solid edges are retained only when both endpoints belong to the subset. Dashed edges are excluded context, not traversal routes.</p>
    <p>An even sum is necessary but not sufficient. Excluded nodes cannot serve as bridges between selected nodes. Singletons are connected; the empty subset is never counted.</p>
    {step.phase === 'visit' && <p>Current node: {step.node}. Discovered nodes waiting in queue: {step.queued}.</p>}
    {step.phase === 'decide' && <table><caption>Subset decision</caption><tbody>
      <tr><th>Even sum?</th><td>{step.sum % 2 ? 'No' : 'Yes'}</td></tr>
      <tr><th>Connected?</th><td>{step.connected === null ? 'Not tested (odd sum)' : step.connected ? 'Yes' : 'No'}</td></tr>
      <tr><th>Counted?</th><td>{step.counted ? 'Yes' : 'No'}</td></tr>
    </tbody></table>}
  </>} />
}
