import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare one answer slot per server.' },
    { id: 'server', label: 'Server', description: 'Look at the branches leaving this server.' },
    { id: 'branch', label: 'Branch', description: 'Count the good servers in one branch and pair them with earlier branches.' },
    { id: 'store', label: 'Store', description: 'Save the total for this server.' },
    { id: 'done', label: 'Result', description: 'Every server has its count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges ([a, b, weight] lists) and signalSpeed, up to 9 servers in this trace',
  url: 'https://leetcode.com/problems/count-pairs-of-connectable-servers-in-a-weighted-tree-network/',
  complexity: 'O(n^2) time in this trace: each server runs a search over its tree. A rerooting pass gives O(n) overall.',
  examples: [
    { label: 'Example 1', input: '{"edges":[[0,1,2],[0,2,3],[2,3,4]],"signalSpeed":2}' },
    { label: 'Example 2', input: '{"edges":[[0,1,4],[1,2,6],[1,3,5],[3,4,3]],"signalSpeed":2}' },
    { label: 'Single edge', input: '{"edges":[[0,1,5]],"signalSpeed":1}' },
    { label: 'Equal weights', input: '{"edges":[[0,1,2],[1,2,2],[2,3,2]],"signalSpeed":2}' },
    { label: 'Largest weights', input: '{"edges":[[0,1,20],[1,2,20],[2,3,20],[3,4,20]],"signalSpeed":10}' },
    { label: 'Long run: 8 edges', input: '{"edges":[[0,1,10],[0,2,12],[0,3,10],[2,4,8],[0,5,10],[0,6,20],[1,7,6],[2,8,20]],"signalSpeed":3}' },
  ],
}

export default function ConnectableServers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <GraphTraversalView title="Weighted tree of servers" n={run.input.edges.length + 1}
      edges={run.input.edges.map(([a, b]) => [a, b])} current={step.server ?? null}
      visited={(step.reached ?? []).map(([node]) => node)}
      tags={Object.fromEntries((step.reached ?? []).map(([node, dist]) => [node, `${dist} ${dist % run.input.signalSpeed === 0 ? 'counts' : 'no'}`]))}
      legend={{ current: 'chosen server c', visited: 'in this branch (distance, counts?)' }} />
    <IndexedSequence label="answer" length={run.input.edges.length + 1} valueAt={i => step.answer[i]} active={step.server ?? -1}
      roleAt={i => (i === step.server ? 'server' : '')} />
    <output aria-label="Branch state">{step.server === null || step.server === undefined ? 'waiting' : `server ${step.server}: ${step.seen ?? 0} servers in earlier branches${step.branch !== null ? `, this branch ${step.branch}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A pair of servers connects through the chosen server only when their paths leave it through different neighbors. Each branch is counted separately and multiplied against the branches before it.</p>
    <p>A server counts in a branch only when the weight of its path from the chosen server is divisible by the signal speed.</p>
  </>} />
}
