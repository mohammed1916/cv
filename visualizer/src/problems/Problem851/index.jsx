import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Build the graph of who is directly richer than whom.' },
    { id: 'visit', label: 'Visit', description: 'Enter dfs for a person and seed the candidate with themselves.' },
    { id: 'memo', label: 'Memo hit', description: 'Reuse an already computed answer.' },
    { id: 'compare', label: 'Compare', description: 'Compare a richer person\'s best answer by quietness.' },
    { id: 'update', label: 'Update', description: 'Adopt a quieter candidate.' },
    { id: 'done', label: 'Complete', description: 'Return the answer array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {richer, quiet} (JSON)',
  url: 'https://leetcode.com/problems/loud-and-rich/',
  complexity: 'O(n + r) time and O(n + r) space with memoization. The visualization caps n at 20 and r at 40.',
  examples: [
    { label: 'Example 1', input: '{"richer":[[1,0],[2,1],[3,1],[3,7],[4,3],[5,3],[6,3]],"quiet":[3,2,5,4,6,1,7,0]}' },
    { label: 'Example 2', input: '{"richer":[],"quiet":[0]}' },
    { label: 'Chain', input: '{"richer":[[0,1],[1,2],[2,3]],"quiet":[2,3,1,0]}' },
    { label: 'Two people, no richer pairs', input: '{"richer":[],"quiet":[1,0]}' },
    { label: 'One richer pair', input: '{"richer":[[1,0]],"quiet":[0,1]}' },
    { label: 'Chain of twenty people', input: '{"richer":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19]],"quiet":[19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]}' },
    { label: 'Long run: 20 people, 30 pairs', input: '{"richer":[[4,6],[9,15],[5,18],[16,19],[9,16],[10,14],[6,14],[7,11],[1,4],[18,19],[11,15],[6,13],[17,18],[15,19],[2,13],[3,7],[4,5],[0,15],[6,16],[5,15],[8,18],[3,5],[17,19],[0,11],[8,11],[15,17],[5,14],[2,7],[3,12],[7,9]],"quiet":[18,5,3,0,16,9,17,15,1,7,4,6,14,12,8,13,2,19,11,10]}' },
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
