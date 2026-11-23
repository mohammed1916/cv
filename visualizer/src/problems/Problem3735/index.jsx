import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StringReverseView from './StringReverseView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON string of lowercase letters (e.g. \"dcba\")",
  url: "https://leetcode.com/problems/lexicographically-smallest-string-after-reverse-ii/",
  complexity: "O(n squared) time: all 2n prefix and suffix reversals are built and compared, each in O(n). O(n) space. The visualization caps the string at 12 letters.",
  question: "Reverse exactly one nonempty prefix or suffix of a string so that the result is as small as possible.",
  approaches: [
    { name: "Try every prefix and suffix", intuition: "Build each of the 2n reversals and keep the smallest string seen.", time: "O(n^2)", space: "O(n)" },
  ],
  examples: [
    { label: "Full reversal", input: "\"dcba\"" },
    { label: "Prefix fix", input: "\"bacd\"" },
    { label: "Reverse tail", input: "\"zyxw\"" },
    { label: 'Single letter', input: '"a"' },
    { label: 'Repeated letters', input: '"aaaa"' },
    { label: 'Longest string', input: '"abcdefghijkl"' },
    { label: 'Long run: 12 letters', input: '"snqduhalmxsr"' },
  ],
}

export default function Problem3735Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <StringReverseView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
