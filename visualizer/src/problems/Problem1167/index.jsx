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
    { label: 'Single stick', input: '{"sticks":[5]}' },
    { label: 'Equal sticks tie', input: '{"sticks":[3,3,3,3]}' },
    { label: 'Largest lengths', input: '{"sticks":[1000,1000,999,1]}' },
    { label: 'Long run: 24 sticks', input: '{"sticks":[7,809,564,485,899,625,552,187,807,908,763,406,624,468,716,832,582,301,216,630,790,818,916,371]}' },
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
