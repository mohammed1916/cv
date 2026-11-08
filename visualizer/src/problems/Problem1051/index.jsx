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
    { label: 'Single height', input: '{"heights":[5]}' },
    { label: 'Longest input: 30 falling heights', input: '{"heights":[30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]}' },
    { label: 'Long run: 30 heights', input: '{"heights":[41,65,66,33,55,5,38,45,67,27,83,60,76,84,10,35,62,52,83,36,57,4,21,40,64,84,6,34,63,30]}' },
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
