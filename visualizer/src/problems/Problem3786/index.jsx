import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'bfs', label: 'Distances', description: 'Breadth-first search from one start node.' },
    { id: 'pair', label: 'Pair', description: 'Add the distance of a pair in the same group.' },
    { id: 'done', label: 'Complete', description: 'Report the total interaction cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON object with n, edges, group)',
  url: 'https://leetcode.com/problems/total-sum-of-interaction-cost-in-tree-groups/',
  complexity: 'O(n^2) time with a breadth-first search from every node. The visualization caps n at 12.',
  examples: [
    { label: 'One group', input: '{"n":3,"edges":[[0,1],[1,2]],"group":[1,1,1]}' },
    { label: 'Split groups', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"group":[1,1,4,4]}' },
  ],
}

export default function TotalInteractionCostTreeGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { group } = run.input
    const roleAt = i => {
      if (step.pair && (i === step.pair[0] || i === step.pair[1])) return 'pair'
      if (step.source === i) return 'source'
      return ''
    }
    return <IndexedSequence label="Group labels" length={group.length} valueAt={i => group[i]} active={step.source >= 0 ? step.source : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The interaction cost of two nodes is the number of edges on the path between them, found here by breadth-first search.</p>
  </>} />
}
