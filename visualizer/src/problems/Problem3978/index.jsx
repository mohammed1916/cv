import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import UniqueMiddleView from './UniqueMiddleView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3978',
  phases: [
    { id: 'start', label: 'Middle', description: 'Locate the middle index and its target value.' },
    { id: 'scan', label: 'Count', description: 'Compare each slot with the target.' },
    { id: 'done', label: 'Result', description: 'Report whether the target is unique.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Odd-length array of integers (e.g. [5, 2, 8, 3, 9])',
  url: 'https://leetcode.com/problems/unique-middle-element/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 15 values.',
  examples: [
    { label: 'Unique middle', input: '[5,2,8,3,9]' },
    { label: 'Repeated middle', input: '[6,6,6]' },
    { label: 'Single value', input: '[7]' },
    { label: "Single element", input: '[42]' },
    { label: "Equal values around the middle", input: '[9,4,9]' },
    { label: "Alternating extremes", input: '[100,1,100,1,100]' },
    { label: "Long run: 15 values", input: '[78,10,59,92,59,2,1,10,18,12,72,93,57,22,30]' },
  ],
}

export default function UniqueMiddleElement() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <UniqueMiddleView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The middle slot is fixed by the length, so one pass over the array settles whether its value repeats.</p>
    </>} />
}
