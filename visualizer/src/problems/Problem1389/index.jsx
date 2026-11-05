import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples } from './algorithm'

const definition = {
  number: '1389', phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, examples,
  inputLabel: 'Object with nums and index (JSON)',
  url: 'https://leetcode.com/problems/create-target-array-in-the-given-order/',
  complexity: 'O(n^2) time in the worst case because each insertion can shift the array, and O(n) space.',
}

export default function TargetArrayVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Target array (position on the left, value on the right)" length={s.target.length} valueAt={i => s.target[i]}
        active={s.at ?? -1} roleAt={i => (s.at !== undefined && i === s.at ? 'inserted' : '')} />
      <p>Inserting <strong>{s.value ?? '-'}</strong> at position <strong>{s.at ?? '-'}</strong>; {run.input.nums.length - (s.target.length) < 0 ? '' : `${run.input.nums.length} values in total.`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Insert, do not overwrite:</strong> each new value goes to its position and the values after it shift right.</p>
    <p>{step.message}</p>
  </>} />
}
