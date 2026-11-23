import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count the ones and zeros.' },
    { id: 'place', label: 'Arrange', description: 'Build the largest odd arrangement.' },
    { id: 'done', label: 'Complete', description: 'Report the result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a binary string s containing at least one 1',
  url: 'https://leetcode.com/problems/maximum-odd-binary-number/',
  complexity: 'O(n) time for the count and build. The visualization caps s at twenty digits.',
  question: "Rearrange the binary digits to form the largest odd number possible.",
  approaches: [
    { name: "Put all ones first except the last one", intuition: "Place every 1 except one at the front, then all zeros, then a final 1 so the number is odd and as large as possible.", time: "O(n)", space: "O(n)" },
    { name: "Sort the digits", intuition: "Sort the digits descending, then move one 1 to the end.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"s":"010"}' },
    { label: 'Example 2', input: '{"s":"0101"}' },
    { label: "Single digit", input: "{\"s\":\"1\"}" },
    { label: "All ones", input: "{\"s\":\"1111\"}" },
    { label: "Longest string, one 1 at the front", input: "{\"s\":\"10000000000000000000\"}" },
    { label: "Long run: 20 digits", input: "{\"s\":\"00110011000001100110\"}" },
  ],
}

export default function MaximumOddBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input digits" length={run.s.length} valueAt={index => run.s[index]} active={-1} />
    <output aria-label="Arrangement">{`Ones: ${step.ones}, zeros: ${step.zeros}, result: ${step.result || '(pending)'}`}</output>
  </>} renderReasoning={() => <>
    <p>An odd binary number ends in 1, so one 1 is reserved for the last place.</p>
    <p>Every remaining 1 goes to the front and every 0 goes between them, which gives the largest value.</p>
  </>} />
}
