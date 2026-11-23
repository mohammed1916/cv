import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MonotoneDpView from './MonotoneDpView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2263',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [3,1,2])',
  url: 'https://leetcode.com/problems/make-array-non-decreasing-or-non-increasing/',
  complexity: 'O(n * m^2) time with the direct prefix and suffix minimum scans, where m is the number of distinct values (O(n * m) with running minima). The visualization caps the array at 12 values with magnitude up to 50; the draft does not verify the official bounds.',
  question: "Find the fewest total changes so the array becomes non-decreasing or non-increasing, where each change of one unit costs one.",
  approaches: [
    { name: "Dynamic programming over candidate values", intuition: "Use the array's values as candidate targets and keep the best cost for each target as the prefix grows.", time: "O(n^2)", space: "O(n)" },
    { name: "Slope trick with heaps", intuition: "Track the breakpoints of the cost function with a max-heap so each element updates the cost in logarithmic time.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Reverse pair', input: '[3,1,2]' },
    { label: 'Already sorted', input: '[1,2,3]' },
    { label: 'Zigzag', input: '[1,5,2,4]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Extreme values, length 12', input: '[-50,50,-50,50,0,0,50,-50,50,-50,0,50]' },
    { label: 'Long run: 12 values', input: '[-6,-13,-1,45,49,7,-24,-19,42,33,23,-35]' },
  ],
}

export default function Problem2263Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MonotoneDpView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
