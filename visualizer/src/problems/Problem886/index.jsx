import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { colourName } from '../../components/shared/graphTraversalModel'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'All people are uncoloured.' },
    { id: 'seed', label: 'Seed component', description: 'Colour an uncoloured person +1 and start BFS.' },
    { id: 'visit', label: 'Dequeue', description: 'Take the next person from the BFS queue.' },
    { id: 'color', label: 'Colour neighbour', description: 'Give each disliked person the opposite group, or confirm it.' },
    { id: 'conflict', label: 'Conflict', description: 'Two people who dislike each other share a group.' },
    { id: 'done', label: 'Complete', description: 'Return whether a valid split exists.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Input {n, dislikes} (JSON, n ≤ 20)',
  url: 'https://leetcode.com/problems/possible-bipartition/',
  complexity: 'O(n + m) time and space for BFS colouring.',
  examples: [
    { label: 'Possible', input: '{"n":4,"dislikes":[[1,2],[1,3],[2,4]]}' },
    { label: 'Triangle (impossible)', input: '{"n":3,"dislikes":[[1,2],[1,3],[2,3]]}' },
    { label: 'Odd cycle of 5', input: '{"n":5,"dislikes":[[1,2],[2,3],[3,4],[4,5],[1,5]]}' },
  ],
}

export default function PossibleBipartition() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { n, dislikes } = run.input
      return <>
        <GraphTraversalView title="Dislike graph with group colours" n={n} labelOf={i => i + 1} edges={dislikes.map(([a, b]) => [a - 1, b - 1])}
          current={step.node === null ? null : step.node - 1} neighbour={step.other === null ? null : step.other - 1}
          visited={step.colors.map((c, i) => (c ? i : -1)).filter(i => i >= 0)} frontier={step.queue.map(x => x - 1)}
          prevFrontier={(run.frames[run.frames.indexOf(step) - 1]?.queue ?? []).map(x => x - 1)}
          tags={Object.fromEntries(step.colors.map((c, i) => [i, `group ${c === 0 ? '?' : colourName(c === 1 ? 0 : 1)}`]))}
          groups={Object.fromEntries(step.colors.map((c, i) => [i, c === 0 ? '' : c === 1 ? 0 : 1]))}
          notes={step.node !== null && step.other !== null ? [`Examining dislike ${step.node}-${step.other}.`] : []} />
        <IndexedSequence label="Group of each person (0 = none, ±1 = the two groups)" length={n} indexOffset={1} valueAt={i => step.colors[i]}
          active={step.node === null ? -1 : step.node - 1} roleAt={i => (step.other === i + 1 ? 'neighbour' : '')} />
        <output aria-label="Queue">BFS queue: {step.queue.length ? step.queue.join(', ') : 'empty'}</output>
        {step.phase === 'done' && <output aria-label="Result">Bipartition possible: {String(run.result)}</output>}
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Why colouring?</strong> Each dislike forces its endpoints into different groups, which is exactly a proper 2-colouring. A graph is 2-colourable if and only if it has no odd cycle.</p>
    </>} />
}
