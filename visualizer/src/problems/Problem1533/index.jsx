import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LargeIndexView from './LargeIndexView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '1533',
  phases: [
    { id: 'start', label: 'Start', description: 'The whole array is the search window.' },
    { id: 'window', label: 'Halves', description: 'Split the window into two equal halves.' },
    { id: 'compare', label: 'Compare', description: 'Ask which half has the larger sum.' },
    { id: 'narrow', label: 'Narrow', description: 'Keep the half that contains the larger element.' },
    { id: 'done', label: 'Result', description: 'Report the index of the larger element.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with array (values are shown hidden in the visual), e.g. {"array":[1,1,2,1]}',
  url: 'https://leetcode.com/problems/find-the-index-of-the-large-integer/',
  complexity: 'O(log n) comparisons and O(1) extra space for n elements, since each comparison discards half of the window. The visualization caps the array at 20 elements.',
  examples: [
    { label: 'Large value at the end', input: '{"array":[5,5,5,5,5,8]}' },
    { label: 'Odd leftover', input: '{"array":[2,2,2,4,2]}' },
    { label: 'Two elements', input: '{"array":[7,9]}' },
    { label: 'Two elements', input: '{"array":[1,2]}' },
    { label: 'Negative values', input: '{"array":[-5,-5,-5,-2]}' },
    { label: 'Extremes: 20 elements', input: '{"array":[-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,1000]}' },
    { label: 'Long run: 20 elements', input: '{"array":[18,18,18,18,18,18,18,18,18,18,18,111,18,18,18,18,18,18,18,18]}' },
  ],
}

export default function FindLargeIntegerIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LargeIndexView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two equal-length halves cancel out their shared base value, so only the half holding the larger element sums higher.</p>
  </>} />
}
