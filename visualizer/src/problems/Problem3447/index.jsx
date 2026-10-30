import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Prepare an empty first-index map.' },
    { id: 'index', label: 'First index', description: 'Keep the first index of each element value.' },
    { id: 'limit', label: 'Limit', description: 'Find the largest group size.' },
    { id: 'sieve', label: 'Sieve', description: 'Give every multiple of each value its smallest index.' },
    { id: 'done', label: 'Result', description: 'Read the answer for each group.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Assignment JSON with groups and elements',
  url: 'https://leetcode.com/problems/assign-elements-to-groups-with-constraints/',
  complexity: 'O(n + m + M log M) time for n groups, m elements and largest group size M. The visualization caps lists at 8 values and values at 50.',
  examples: [
    { label: 'Example 1', input: '{"groups":[8,4,3,2,4],"elements":[4,2]}' },
    { label: 'Example 2', input: '{"groups":[2,3,5,7],"elements":[5,3,3]}' },
    { label: 'Example 3', input: '{"groups":[10,21,30,41],"elements":[2,1]}' },
  ],
}

export default function AssignElementsToGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Groups" length={step.groups.length} valueAt={index => step.groups[index]} active={-1} />
    <IndexedSequence label="Best element index for each size" length={step.limit + 1}
      valueAt={index => (step.best[index] === null ? '–' : step.best[index])}
      active={step.multiple} roleAt={index => (step.best[index] !== null ? 'filled' : '')} />
    <p>{step.assigned ? `Assigned: ${JSON.stringify(step.assigned)}` : `Elements: ${run.input.elements.join(', ')}`}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An element can go to a group when its size is divisible by the element, so the smallest index for a size is the smallest index among its divisors.</p>
  </>} />
}
