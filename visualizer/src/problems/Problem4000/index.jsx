import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitSumView from './DigitSumView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Set the remaining sum." },
    { id: "check", label: "Check", description: "The sum cannot fit." },
    { id: "place", label: "Place", description: "Choose the next digit." },
    { id: "done", label: "Result", description: "Read the digits as one integer." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with n (digit count) and s (digit sum), e.g. {\"n\":4,\"s\":23}",
  url: "https://leetcode.com/problems/largest-integer-with-given-digit-sum/",
  complexity: "O(n) time and O(n) space for n digit positions. The visualization caps n at 10.",
  examples: [
    { label: "Four digits", input: "{\"n\":4,\"s\":23}" },
    { label: "Sum too large", input: "{\"n\":3,\"s\":30}" },
    { label: "All zeros", input: "{\"n\":5,\"s\":0}" },
    { label: "One digit", input: '{"n":1,"s":9}' },
    { label: "Two digits with sum nine", input: '{"n":2,"s":9}' },
    { label: "Maximum sum for ten digits", input: '{"n":10,"s":90}' },
    { label: "Long run: 10 digits, sum 45", input: '{"n":10,"s":45}' },
  ],
}

export default function Problem4000() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitSumView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
