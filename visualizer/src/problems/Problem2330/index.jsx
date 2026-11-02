import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MirrorPairsView from './MirrorPairsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2330',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. abcdba)',
  url: 'https://leetcode.com/problems/valid-palindrome-iv/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the string at 20 letters; the draft does not verify the official length bound.',
  examples: [
    { label: 'One mismatch', input: 'abcdba' },
    { label: 'Three mismatches', input: 'abcdef' },
    { label: 'Odd length', input: 'abcdeba' },
  ],
}

export default function Problem2330Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MirrorPairsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
