import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Search range', description: 'Left ends of valid windows lie between lo and hi.' },
    { id: 'probe', label: 'Test the middle', description: 'Compare the two edges of the window starting at mid.' },
    { id: 'done', label: 'Window', description: 'The k values starting at lo are the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Sorted array, k and x (JSON object)',
  url: 'https://leetcode.com/problems/find-k-closest-elements/',
  complexity: 'O(log(n − k) + k) time: a binary search for the left end, then copying the window.',
  examples: [
    { label: 'Middle', input: '{"arr":[1,3,5,7,9,11],"k":3,"x":6}' },
    { label: 'Left edge', input: '{"arr":[2,4,6,8],"k":2,"x":-5}' },
    { label: 'Duplicate', input: '{"arr":[1,2,2,2,3],"k":2,"x":2}' },
  ],
}

export default function FindKClosest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, k, x } = run.input
    const lo = step.lo
    const hi = step.hi
    const roleAt = i => {
      const tags = []
      if (step.mid !== null && i === step.mid) tags.push('mid')
      if (i === lo) tags.push('lo')
      if (step.phase === 'done' ? i >= lo && i <= lo + k - 1 : i === hi) tags.push(step.phase === 'done' ? 'answer' : 'hi')
      return tags.join(' · ')
    }
    return <>
      <IndexedSequence label={`Sorted values, target x = ${x}`} length={arr.length} active={step.mid ?? -1} valueAt={i => arr[i]} roleAt={roleAt} />
      <output aria-label="Search range">{`Search range lo ${lo} to hi ${hi}${step.mid !== null && step.mid !== undefined ? `; testing mid ${step.mid}` : ''}; window length ${k}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why binary search:</strong> the best window is contiguous, so its left end is the only number to find; the test at mid tells which half must contain it.</p>
  </>} />
}
