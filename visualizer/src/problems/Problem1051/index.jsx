import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Heights (JSON object with heights)',
  url: 'https://leetcode.com/problems/height-checker/',
  complexity: 'O(n log n) time for the sorted copy and O(n) extra space. The visualization caps input at 30 heights.',
  examples: [
    { label: 'Repeated heights', input: '{"heights":[6,3,5,3,8,4,6,2,7,5]}' },
    { label: 'Already sorted', input: '{"heights":[2,2,4,6,6,9]}' },
    { label: 'All equal', input: '{"heights":[7,7,7,7]}' },
    { label: 'Reversed odd', input: '{"heights":[9,7,5,3,1]}' },
  ],
}

export default function HeightChecker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { heights, expected, current, mismatches } = step.snapshot
    return <>
      <IndexedSequence label="Lineup" length={heights.length} valueAt={i => heights[i]} active={current}
        roleAt={i => (mismatches.includes(i) ? 'mismatch' : i === current ? 'current' : '')} />
      {expected && <IndexedSequence label="Sorted target" length={expected.length} valueAt={i => expected[i]} active={current}
        roleAt={i => (i === current ? 'current' : '')} />}
      <p>Mismatches so far: {step.snapshot.count} of {heights.length}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Sorting a copy gives the required order for every position, so the answer only counts positions where the original and the target disagree. It does not count the swaps needed to fix them.</p>
  </>} />
}
