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
    { label: 'Own case 1', input: '{"arr1":[2,6,4,7,8],"arr2":[2,4,3,5]}' },
    { label: 'Own case 2', input: '{"arr1":[2,6,4,7,8],"arr2":[5,4,2]}' },
    { label: 'Single element each', input: '{"arr1":[3],"arr2":[3]}' },
    { label: 'Equal arrays', input: '{"arr1":[2,4,6],"arr2":[2,4,6]}' },
    { label: 'Boundary values 0 and 20', input: '{"arr1":[0,20],"arr2":[20,0,20]}' },
    { label: 'Long run: 8 values each', input: '{"arr1":[11,5,16,18,15,14,8,15],"arr2":[18,8,7,20,3,13,17,18]}' },
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
