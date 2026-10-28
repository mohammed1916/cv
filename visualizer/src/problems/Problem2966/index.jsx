import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort the values ascending.' },
    { id: 'group', label: 'Group', description: 'The next three values fit within k.' },
    { id: 'fail', label: 'Fail', description: 'A triple spans more than k.' },
    { id: 'done', label: 'Complete', description: 'Report the groups or the empty answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (3, 6, 9 or 12 integers) and k (JSON)',
  url: 'https://leetcode.com/problems/divide-array-into-arrays-with-max-difference/',
  complexity: 'O(n log n) for the sort and one linear pass over the sorted values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,4,8,7,9,3,5,1],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1,3,3,2,7,3],"k":3}' },
  ],
}

export default function DivideWithMaxDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = [...run.input.nums].sort((a, b) => a - b)
    return <>
      <IndexedSequence label="Sorted values" length={sorted.length} valueAt={i => sorted[i]}
        active={step.at} roleAt={i => (step.at >= 0 && i >= step.at && i < step.at + 3 ? 'current triple' : '')} />
      <output aria-label="Groups so far">{`Groups formed: ${step.groups.length}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Once the values are sorted, the three values with the smallest spread are always neighbours, so consecutive triples are the only candidates to check.</p>
    <p>If any triple spans more than k, no arrangement can succeed, and the answer is an empty array.</p>
  </>} />
}
