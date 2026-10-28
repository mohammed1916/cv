import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

// Builds the 256-entry count JSON from [value, count] pairs.
const countsJson = pairs => {
  const count = Array(256).fill(0)
  for (const [value, times] of pairs) count[value] = times
  return JSON.stringify(count)
}

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up the counts to get the number of samples.' },
    { id: 'scan', label: 'Scan values', description: 'Visit each value with a count to track min, max, sum and mode.' },
    { id: 'median', label: 'Mean and median', description: 'Divide the sum by the total and find the middle sample.' },
    { id: 'done', label: 'Return', description: 'Return min, max, mean, median and mode.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Counts for values 0 to 255 (JSON array of 256 integers)',
  url: 'https://leetcode.com/problems/statistics-from-a-large-sample/',
  complexity: 'O(256 + total) time and O(1) extra space. The visualization caps the total at 200 samples.',
  examples: [
    { label: 'Example 1', input: countsJson([[1, 1], [2, 3], [3, 4]]) },
    { label: 'Single value', input: countsJson([[7, 1]]) },
    { label: 'Odd total', input: countsJson([[5, 2], [9, 1]]) },
  ],
}

export default function LargeSample() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sample counts by value" length={256} valueAt={i => run.input[i]}
      active={step.value ?? -1} roleAt={i => (run.input[i] > 0 ? 'has samples' : '')} />
    <output aria-label="Statistics state">{step.message}</output>
    {step.phase === 'done' && <output aria-label="Statistics result">Result: [{run.result.join(', ')}]</output>}
  </>} renderReasoning={() => <>
    <p>Values are already sorted by their index, so the counts describe the sorted sample without expanding it.</p>
    <p>The median is found by walking the counts until the wanted sorted position is passed.</p>
    <p>For an even total, the median averages the two middle samples, which may be equal or differ by one or more.</p>
  </>} />
}
