import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No root has been processed yet.' },
    { id: 'root', label: 'Root', description: 'Grow the best connected subgraph from this node.' },
    { id: 'done', label: 'Complete', description: 'Report the best score for every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON object with n, edges, good)',
  url: 'https://leetcode.com/problems/maximum-subgraph-score-in-a-tree/',
  complexity: 'O(n^2) time, one tree walk per root. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1],[1,2]],"good":[1,0,1]}' },
    { label: 'Example 2', input: '{"n":5,"edges":[[1,0],[1,2],[1,3],[3,4]],"good":[0,1,0,1,1]}' },
  ],
}

export default function MaximumSubgraphScoreInATree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Node flags" length={run.input.n} valueAt={i => (run.input.good[i] ? 'good' : 'bad')}
      active={step.root} roleAt={i => (step.answers[i] !== undefined ? `score ${step.answers[i]}` : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each child contributes its best subtree score only when that score is positive, because a negative subtree can always be left out.</p>
  </>} />
}
