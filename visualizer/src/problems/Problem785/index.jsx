import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { edgesFromAdjacency, colourTags } from '../../components/shared/graphTraversalModel'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'All nodes uncoloured.' },
    { id: 'seed', label: 'Seed component', description: 'Colour a new component root with 0.' },
    { id: 'color', label: 'Colour neighbour', description: 'Give an unseen neighbour the opposite colour.' },
    { id: 'ok', label: 'Edge ok', description: 'Neighbour already has the opposite colour.' },
    { id: 'conflict', label: 'Conflict', description: 'Both endpoints share a colour: odd cycle.' },
    { id: 'done', label: 'Complete', description: 'Return the verdict.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Adjacency list graph (JSON)',
  url: 'https://leetcode.com/problems/is-graph-bipartite/',
  complexity: 'O(V + E) time, O(V) space. Visualization limited to 20 nodes.',
  examples: [
    { label: 'Odd cycle (false)', input: '[[1,2,3],[0,2],[0,1,3],[0,2]]' },
    { label: 'Bipartite (true)', input: '[[1,3],[0,2],[1,3],[0,2]]' },
    { label: 'Two components', input: '[[1],[0],[3],[2],[]]' },
  ],
}
const label = c => c === -1 ? '?' : c === 0 ? 'A' : 'B'
// Queue entries still waiting: everything after the node being processed (a freshly seeded root waits too).
const waiting = f => (f.phase === 'seed' ? f.queue : f.u >= 0 ? f.queue.slice(f.queue.indexOf(f.u) + 1) : f.queue)
const finished = f => (f.u >= 0 ? f.queue.slice(0, f.queue.indexOf(f.u)) : [])
export default function IsGraphBipartite() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const prev = run.frames[run.frames.indexOf(step) - 1]
    const u = step.u >= 0 ? step.u : null, v = step.v >= 0 ? step.v : null
    return <>
    <GraphTraversalView title="Graph being two-coloured" n={run.input.length} edges={edgesFromAdjacency(run.input)} current={u} neighbour={v}
      visited={step.color.map((c, i) => (c === -1 ? -1 : i)).filter(i => i >= 0)} frontier={waiting(step)} prevFrontier={prev ? waiting(prev) : []} done={finished(step)}
      tags={colourTags(step.color)} groups={Object.fromEntries(step.color.map((c, i) => [i, c]).filter(([, c]) => c !== -1))}
      notes={u !== null && v !== null ? [`Examining edge ${u}-${v}: node ${u} has colour ${label(step.color[u])}, node ${v} has colour ${label(step.color[v])}.`] : []}
      legend={{ current: 'node being expanded', neighbour: 'neighbour being checked', frontier: 'in the BFS queue' }} />
    <IndexedSequence label="Node colours (A=0, B=1)" length={run.input.length} active={step.u} valueAt={i => label(step.color[i])} roleAt={i => i === step.v ? 'neighbour' : ''} />
    <IndexedSequence label="Adjacency lists" length={run.input.length} active={step.u} valueAt={i => run.input[i].join(',') || '-'} roleAt={i => i === step.v ? 'neighbour' : ''} />
    <IndexedSequence label="BFS queue" length={Math.max(step.queue.length, 1)} valueAt={i => step.queue[i] ?? ' '} />
    <output aria-label="Verdict">{step.phase === 'done' ? `Bipartite: ${run.result}` : 'Colouring...'}</output>
  </>}} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A graph is bipartite exactly when it has no odd cycle. BFS layers alternate colours, so the first same-colour edge closes an odd cycle.</p>
    <p>Disconnected graphs need a fresh BFS from every uncoloured node.</p>
  </>} />
}
