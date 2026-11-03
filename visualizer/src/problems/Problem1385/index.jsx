import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Arrays and distance (JSON object with arr1, arr2, d)',
  url: 'https://leetcode.com/problems/find-the-distance-value-between-two-arrays/',
  complexity: 'O(n·m) time and O(1) extra space for arrays of n and m values. The visualization accepts up to 50 values per array.',
  examples: [
    { label: 'Far values', input: '{"arr1":[6,2,20],"arr2":[1,30],"d":3}' },
    { label: 'Close pairs', input: '{"arr1":[1,4,9],"arr2":[2,8],"d":1}' },
    { label: 'Negatives', input: '{"arr1":[-5,0,7],"arr2":[-4,3],"d":2}' },
  ],
}

export default function DistanceValueBetweenArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const verdict = step.snapshot.verdict
    return <>
      <IndexedSequence label="arr1 (candidates)" length={run.input.arr1.length} valueAt={i => run.input.arr1[i]}
        active={step.snapshot.index ?? -1} roleAt={i => (verdict[i] === true ? 'counted' : verdict[i] === false ? 'rejected' : '')} />
      <IndexedSequence label="arr2 (blockers)" length={run.input.arr2.length} valueAt={i => run.input.arr2[i]}
        active={step.snapshot.other ?? -1} roleAt={() => ''} />
      <p>Distance limit d = {run.input.d}. Count so far: {step.snapshot.count}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A candidate is rejected by the first arr2 value within distance d. The requirement is strict, so a gap exactly equal to d still rejects it.</p>
  </>} />
}
