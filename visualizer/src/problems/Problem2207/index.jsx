import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SubseqView from './SubseqView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2207',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with text and a two-letter pattern, e.g. {"text":"abdcdbc","pattern":"ac"}',
  url: 'https://leetcode.com/problems/maximize-number-of-subsequences-in-a-string/',
  complexity: 'O(n) time and O(1) extra space. The page caps the text at 12 letters.',
  question: "Add one character to a text so that the number of times a two-letter pattern appears as a subsequence is as large as possible.",
  approaches: [
    { name: "Compare the two insertion options", intuition: "Adding the first pattern letter at the start or the second at the end gives the most new subsequences, so count both options and keep the larger.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Mixed letters', input: '{"text":"abdcdbc","pattern":"ac"}' },
    { label: 'Repeated pair', input: '{"text":"aabb","pattern":"ab"}' },
    { label: 'Same letter', input: '{"text":"aaa","pattern":"aa"}' },
    { label: 'Single letter text', input: '{"text":"a","pattern":"ab"}' },
    { label: 'Pattern absent', input: '{"text":"abc","pattern":"zz"}' },
    { label: 'Longest allowed: 12 letters', input: '{"text":"abcabcabcabc","pattern":"ca"}' },
  ],
}

export default function Problem2207Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SubseqView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
