import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Build the graph of who is directly richer than whom.' },
    { id: 'visit', label: 'Visit', description: 'Enter dfs for a person and seed the candidate with themselves.' },
    { id: 'memo', label: 'Memo hit', description: 'Reuse an already computed answer.' },
    { id: 'compare', label: 'Compare', description: 'Compare a richer person\'s best answer by quietness.' },
    { id: 'update', label: 'Update', description: 'Adopt a quieter candidate.' },
    { id: 'done', label: 'Complete', description: 'Return the answer array.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {richer, quiet} (JSON)',
  url: 'https://leetcode.com/problems/loud-and-rich/',
  complexity: 'O(n + r) time and O(n + r) space with memoization. The visualization caps n at 20 and r at 40.',
  examples: [
    { label: 'Example 1', input: '{"richer":[[1,0],[2,1],[3,1],[3,7],[4,3],[5,3],[6,3]],"quiet":[3,2,5,4,6,1,7,0]}' },
    { label: 'Example 2', input: '{"richer":[],"quiet":[0]}' },
    { label: 'Chain', input: '{"richer":[[0,1],[1,2],[2,3]],"quiet":[2,3,1,0]}' },
  ],
}

export default function LoudAndRich() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const prev = run.frames[run.frames.indexOf(step) - 1]
    const resolved = step.ans.map((a, i) => (a === -1 ? -1 : i)).filter(i => i >= 0)
    return <>
    <GraphTraversalView title="Richer-than graph (arrow points from richer to poorer)" n={run.input.quiet.length} directed edges={run.input.richer}
      current={step.x} neighbour={step.cand !== null && step.cand !== step.x ? step.cand : null} visited={resolved} done={resolved} frontier={step.path} prevFrontier={prev ? prev.path : []}
      frontierKind="stack" frontierTitle="dfs call stack (top is last)" tags={Object.fromEntries(step.ans.map((a, i) => [i, `quiet ${run.input.quiet[i]}, ans ${a === -1 ? '?' : a}`]))}
      legend={{ current: 'person being resolved', neighbour: 'candidate answer', frontier: 'in a dfs call', done: 'answer known' }} />
    <IndexedSequence label="quiet (index = person)" length={run.input.quiet.length} active={step.x ?? -1} valueAt={i => run.input.quiet[i]} roleAt={i => i === step.cand ? 'left' : ''} />
    <IndexedSequence label="ans so far (? = unknown)" length={run.input.quiet.length} active={step.x ?? -1} valueAt={i => (step.ans[i] === -1 ? '?' : step.ans[i])} />
    <StackLane title="dfs call stack" items={step.path.map(p => `dfs(${p})`)} note={step.cand == null ? '' : `candidate ${step.cand}`} />
    <output aria-label="Richer pairs">richer: {run.input.richer.map(([a, b]) => `${a} > ${b}`).join(', ') || 'none'}</output>
  </>}} renderReasoning={() => <>
    <p>Everyone richer than a richer person is also richer than you, so the answer for x is the quietest among x and the answers of its direct richer neighbours. Memoization makes each person resolved once.</p>
    <p>Quietness values are distinct, so comparisons never tie.</p>
  </>} />
}
