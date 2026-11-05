import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2126',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with mass and asteroids',
  url: 'https://leetcode.com/problems/destroying-asteroids/',
  complexity: 'O(n log n) time for the sort, O(n) space for the sorted copy.',
  examples: [
    { label: 'All destroyed', input: '{"mass":6,"asteroids":[2,7,3,11]}' },
    { label: 'Blocked by a big one', input: '{"mass":3,"asteroids":[2,4,20]}' },
  ],
}

export default function Problem2126Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Asteroids in sorted order" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.i} roleAt={i => (i === step.i ? 'hit now' : i > step.i ? 'waiting' : 'destroyed')} />
          <p>Planet mass now: {step.mass}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
