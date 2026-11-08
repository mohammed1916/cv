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
    { label: 'Own case 1', input: '{"bottom":3,"top":10,"special":[5,7]}' },
    { label: 'Own case 2', input: '{"bottom":7,"top":9,"special":[8,7,9]}' },
    { label: 'Single floor', input: '{"bottom":5,"top":5,"special":[]}' },
    { label: 'Special floors at both ends', input: '{"bottom":1,"top":4,"special":[1,4]}' },
    { label: 'Largest range, 12 special', input: '{"bottom":1,"top":61,"special":[17,45,2,12,8,41,56,16,37,39,46,26]}' },
    { label: 'Long run: 61 floors', input: '{"bottom":10,"top":70,"special":[26,54,11,21,17,50]}' },
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
