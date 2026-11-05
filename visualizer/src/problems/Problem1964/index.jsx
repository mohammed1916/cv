import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1964',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of obstacle heights (e.g. [1,2,3,2])',
  url: 'https://leetcode.com/problems/find-the-longest-valid-obstacle-course-at-each-position/',
  complexity: 'O(n log n) time: one binary search per obstacle over the tails list.',
  examples: [
    { label: 'Dip and rise', input: '[1,2,3,2]' },
    { label: 'Mixed', input: '[5,1,5,5,1]' },
  ],
}

export default function Problem1964Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="Obstacles" length={run.input.obstacles.length} valueAt={i => run.input.obstacles[i]} active={step.i} roleAt={i => (i === step.i ? 'l' : '')} />
      <IndexedSequence label="Tails (smallest last height for each course length)" length={Math.max(1, step.tails.length)} valueAt={i => step.tails[i] ?? '·'} active={step.pos ?? -1} roleAt={i => (i === step.pos ? 'window' : '')} />
      <IndexedSequence label="Longest course ending here" length={step.ans.length || 1} valueAt={i => step.ans[i] ?? '·'} active={step.i} roleAt={i => (i === step.i ? 'written' : '')} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
