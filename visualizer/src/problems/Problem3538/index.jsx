import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at sign 0 with no merges.' },
    { id: 'extend', label: 'Extend', description: 'Price the roads from a kept sign to each later kept sign.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest way to finish with exactly k merges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with l, n, k, position and time (JSON)',
  url: 'https://leetcode.com/problems/merge-operations-for-minimum-travel-time/',
  complexity: 'O(n^3 * k) time for the state table. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"l":10,"n":4,"k":1,"position":[0,3,8,10],"time":[5,8,3,6]}' },
    { label: 'Example 2', input: '{"l":5,"n":5,"k":1,"position":[0,1,2,3,5],"time":[8,3,9,3,3]}' },
  ],
}

export default function MergeTravelTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sign positions" length={run.input.n} valueAt={i => run.input.position[i]} active={step.a ?? -1}
      roleAt={i => (i < (step.a ?? 0) ? 'passed' : '')} />
    <output aria-label="Best">{`Best total: ${step.best === null ? 'not known yet' : step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Signs merged away carry their time forward to the next kept sign, so the cost of a road depends on the kept sign before it.</p>
  </>} />
}
