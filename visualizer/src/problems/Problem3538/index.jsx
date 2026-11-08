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
    { label: 'Own: four stops', input: '{"l":12,"n":4,"k":1,"position":[0,4,7,12],"time":[6,2,9,4]}' },
    { label: 'Own: three stops, k 0', input: '{"l":9,"n":3,"k":0,"position":[0,2,9],"time":[3,5,4]}' },
    { label: 'Two positions', input: '{"l":1,"n":2,"k":0,"position":[0,1],"time":[1,1]}' },
    { label: 'Equal gaps', input: '{"l":6,"n":4,"k":1,"position":[0,2,4,6],"time":[3,3,3,3]}' },
    { label: 'Largest length and times', input: '{"l":100,"n":12,"k":10,"position":[0,9,18,27,36,45,54,63,72,81,90,100],"time":[8,8,8,8,8,8,8,8,8,8,8,8]}' },
    { label: 'Long run: 12 positions', input: '{"l":42,"n":12,"k":5,"position":[0,5,7,10,12,15,17,24,28,35,36,42],"time":[5,2,3,1,1,8,5,8,2,4,6,7]}' },
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
