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
  examples: [
    { label: 'Mixed letters', input: '{"text":"abdcdbc","pattern":"ac"}' },
    { label: 'Repeated pair', input: '{"text":"aabb","pattern":"ab"}' },
    { label: 'Same letter', input: '{"text":"aaa","pattern":"aa"}' },
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
