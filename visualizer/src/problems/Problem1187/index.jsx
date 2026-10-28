import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No previous value and no replacements yet.' },
    { id: 'step', label: 'Position', description: 'Keep or replace this value for each reachable last value.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest replacements, or minus one.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr1 and arr2 (JSON)',
  url: 'https://leetcode.com/problems/make-array-strictly-increasing/',
  complexity: 'O(n * m log m) time with the sorted unique arr2. The visualization caps each array at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"arr1":[1,5,3,6,7],"arr2":[1,3,2,4]}' },
    { label: 'Example 2', input: '{"arr1":[1,5,3,6,7],"arr2":[4,3,1]}' },
  ],
}

export default function IncreasingArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr1" length={run.input.arr1.length} active={step.index}
      valueAt={index => run.input.arr1[index]} roleAt={index => (index < step.index ? 'done' : '')} />
    <output aria-label="Possible last values">{step.states.length === 0 ? 'No possible states' : `States (last value: replacements): ${step.states.map(([last, ops]) => `${last}: ${ops}`).join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the last kept value matters for the next position, so the search keeps the fewest replacements for each possible last value.</p>
    <p>Replacing a value with the smallest larger element of arr2 always leaves the most room, so one replacement per state is enough.</p>
  </>} />
}
