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
    { label: 'Blocked by a big one', input: '{"mass":3,"asteroids":[2,4,20]}' }, { label: "Single asteroid", input: "{\"mass\":1,\"asteroids\":[1]}" }, { label: "Equal size", input: "{\"mass\":5,\"asteroids\":[5,5]}" }, { label: "Largest values", input: "{\"mass\":100000,\"asteroids\":[100000,1,100000]}" }, { label: "Long run: 30 asteroids", input: "{\"mass\":1000,\"asteroids\":[1297,1162,265,90,905,943,1797,1325,967,507,1682,144,405,1056,293,65,215,1373,1302,433,627,205,1967,771,704,1136,1043,1294,887,892]}" },
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
