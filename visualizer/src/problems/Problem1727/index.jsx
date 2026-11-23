import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1727',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON matrix of 0s and 1s (1 to 6 by 1 to 6 in this visual)',
  url: 'https://leetcode.com/problems/largest-submatrix-with-rearrangements/',
  question: "Columns may be rearranged; find the largest submatrix made entirely of ones.",
  approaches: [
    { name: "Sort column heights per row", intuition: "For each row, treat the column heights as bars sorted from tallest, and find the largest rectangle.", time: "O(m * n log n)", space: "O(n)" },
  ],
}

export default function Problem1727Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Any column order is allowed, so in each row the best rectangle uses the columns with the tallest runs of 1s.</p>
      <p>Sorting the heights gives the best rectangle that ends at this row: the j-th tallest column can extend j+1 columns wide.</p>
    </>}
  />
}
