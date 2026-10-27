import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the array.' },
    { id: 'fix', label: 'Fix i', description: 'Choose the first index and reset j and k.' },
    { id: 'move', label: 'Move pointer', description: 'Sum too small: advance j. Too large: retreat k.' },
    { id: 'count', label: 'Count runs', description: 'Sum matches with distinct ends: multiply the duplicate run lengths.' },
    { id: 'pairs', label: 'Equal block', description: 'Sum matches with j and k on equal values: count pairs in the block.' },
    { id: 'done', label: 'Complete', description: 'Return the count modulo 10^9 + 7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {arr, target} (JSON)',
  url: 'https://leetcode.com/problems/3sum-with-multiplicity/',
  complexity: 'O(n^2) time after sorting, O(1) extra space. arr is capped at 40 values here.',
  examples: [
    { label: 'Example 1', input: '{"arr":[1,1,2,2,3,3,4,4,5,5],"target":8}' },
    { label: 'Example 2', input: '{"arr":[1,1,2,2,2,2],"target":5}' },
    { label: 'Example 3', input: '{"arr":[2,1,3],"target":6}' },
  ],
}

export default function ThreeSumMultiplicity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted arr (i, j, k pointers)" length={run.sorted.length} active={step.i} valueAt={i => run.sorted[i]}
      roleAt={i => i === step.j ? 'left' : i === step.k ? 'right' : step.j2 !== undefined && i > step.j && i <= step.j2 ? 'run' : step.k2 !== undefined && i < step.k && i >= step.k2 ? 'run' : ''} />
    <output aria-label="Total">{step.sum === undefined ? '' : `Current sum ${step.sum} (target ${run.input.target}). `}Triples counted: {step.ans}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Equal values form blocks; when both pointers sit on matching sums, the choices on each side multiply (or choose pairs inside one block) instead of enumerating each duplicate.</p>
  </>} />
}
