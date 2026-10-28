import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Marks', description: 'Sort the special floors and place sentinels just outside the range.' },
    { id: 'gap', label: 'Gap', description: 'Count the floors strictly between two neighbouring marks.' },
    { id: 'better', label: 'Longer run', description: 'This run is longer than any seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with bottom, top and special (distinct floors)',
  url: 'https://leetcode.com/problems/maximum-consecutive-floors-without-special-floors/',
  complexity: 'O(s log s) time for s special floors, O(s) space. The visualization caps the range at 61 floors.',
  examples: [
    { label: 'Example 1', input: '{"bottom":2,"top":9,"special":[4,6]}' },
    { label: 'Example 2', input: '{"bottom":6,"top":8,"special":[7,6,8]}' },
  ],
}

export default function MaxConsecutiveFloors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const specialSet = new Set(run.input.special)
    const span = new Set()
    if (step.from !== null) for (let f = step.from; f <= step.to; f++) span.add(f)
    return <>
      <IndexedSequence label="Floors" length={run.input.top - run.input.bottom + 1} valueAt={i => run.input.bottom + i}
        roleAt={i => (specialSet.has(run.input.bottom + i) ? 'special' : span.has(run.input.bottom + i) ? 'run' : '')} />
      <output aria-label="Best run">{`Longest run so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Special floors split the range into runs. The longest run is the widest gap between neighbouring marks.</p>
    <p>Sentinels one below the bottom and one above the top make the first and last runs count the same way as the rest.</p>
  </>} />
}
