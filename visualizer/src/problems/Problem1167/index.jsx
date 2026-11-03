import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from './algorithm'

const definition = {
  number: '1167',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"sticks": [positive integers]}',
  url: 'https://leetcode.com/problems/minimum-cost-to-connect-sticks/description/',
  complexity: 'O(n log n) time and O(n) space for n sticks. The visualization caps the input at 24 sticks.',
  examples: [
    { label: 'Four sticks', input: '{"sticks":[4,2,7,3]}' },
    { label: 'One stick', input: '{"sticks":[5]}' },
    { label: 'Equal sticks', input: '{"sticks":[1,1,1,1]}' },
  ],
}

export default function MinimumCostToConnectSticksVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => {
        const snap = step.snapshot
        return <>
          <IndexedSequence
            label="Min-heap (sorted view)"
            length={snap.heap.length}
            active={-1}
            valueAt={index => snap.heap[index]}
            roleAt={index => index < 2 && step.phase === 'join' ? 'pair' : ''}
          />
          <p>Joined pair: {snap.pair.length ? snap.pair.join(' + ') : 'none yet'}{snap.joined !== null && snap.joined !== undefined ? `, new stick ${snap.joined}` : ''}</p>
        </>
      }}
      renderReasoning={({ step }) => <p>Joins so far: {step.snapshot.joins}. Total cost: {step.snapshot.total}.</p>}
    />
  )
}
