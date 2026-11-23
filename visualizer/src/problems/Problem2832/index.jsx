import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MaxRangeView from './MaxRangeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (e.g. [3, 1, 3, 2])',
  url: 'https://leetcode.com/problems/maximal-range-that-each-element-is-maximum-in-it/',
  complexity: 'O(n) time and O(n) space: two monotonic-stack passes find each boundary once. The visualization caps the array at 12 values.',
  question: "For each index, find the widest range where that element is the maximum.",
  approaches: [
    { name: "Monotonic stacks for nearest greater values", intuition: "Find the nearest larger element on each side; the range is between those boundaries.", time: "O(n)", space: "O(n)" },
    { name: "Expand from each index", intuition: "Grow left and right from each element while values stay at most it.", time: "O(n^2)", space: "O(1)" },
  ],
  examples: [
    { label: 'Mixed heights', input: '[2, 7, 3, 3, 1]' },
    { label: 'Ties', input: '[4, 4, 4]' },
    { label: 'Single', input: '[9]' },
    { label: "Single bar", input: "[9]" },
    { label: "Twelve equal bars", input: "[5,5,5,5,5,5,5,5,5,5,5,5]" },
    { label: "Tall bars at both ends", input: "[20,1,20,1]" },
    { label: "Long run: 12 seeded heights", input: "[6,19,16,13,18,7,20,9,6,7,16,1]" },
  ],
}

export default function Problem2832Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <MaxRangeView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>An index is the maximum of every range that stops just before the nearest strictly greater value on each side. Equal values do not stop the range.</p>
      <p>{run ? `Lengths: ${run.result.join(', ')}.` : ''}</p>
    </>} />
}
