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
