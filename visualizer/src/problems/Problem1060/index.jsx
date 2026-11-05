import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MissingLineView from './MissingLineView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1060',
  phases: [
    { id: 'start', label: 'Start', description: 'Set the search range over indices.' },
    { id: 'probe', label: 'Probe', description: 'Count the missing values before the middle index.' },
    { id: 'left', label: 'Left', description: 'The answer is at or before the probe.' },
    { id: 'right', label: 'Right', description: 'The answer is after the probe.' },
    { id: 'answer', label: 'Locate', description: 'Find the last index with too few missing values.' },
    { id: 'done', label: 'Result', description: 'Step up from that element by the remainder.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (strictly increasing integers) and k (positive)',
  url: 'https://leetcode.com/problems/missing-element-in-sorted-array/description/',
  complexity: 'O(log n) time for n array elements and O(1) extra space, from a binary search. The visualization caps nums at 10 values from 0 to 100 and k at 50; the official bounds are not verified.',
  examples: [
    { label: 'First missing', input: '{"nums":[2,5,6,11,14],"k":1}' },
    { label: 'Middle missing', input: '{"nums":[2,5,6,11,14],"k":4}' },
    { label: 'Beyond the last element', input: '{"nums":[2,5,6,11,14],"k":9}' },
  ],
}

export default function MissingElementInSortedArray() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MissingLineView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each index has a missing count that never decreases, so a binary search finds the last element with fewer than k missing values.</p>}
    />
  )
}
