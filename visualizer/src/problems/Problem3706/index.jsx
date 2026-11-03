import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WordDistanceSweepView from './WordDistanceSweepView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of lowercase words (e.g. [\"sun\",\"moon\"])",
  url: "https://leetcode.com/problems/maximum-distance-between-unequal-words-in-array-ii/",
  complexity: "O(n) time and O(1) extra space: one pass after locating the first word unlike words[0]. Built for larger inputs than the first variant; the visualization caps the list at 12 words.",
  examples: [
    { label: "Early partner", input: "[\"sun\",\"sun\",\"moon\",\"sun\"]" },
    { label: "Alternating runs", input: "[\"a\",\"b\",\"b\",\"b\",\"a\",\"a\",\"b\"]" },
    { label: "Equal pair", input: "[\"fox\",\"fox\"]" },
  ],
}

export default function Problem3706Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WordDistanceSweepView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
