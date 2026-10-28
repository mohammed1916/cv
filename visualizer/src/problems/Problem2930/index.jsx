import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No letters placed yet.' },
    { id: 'position', label: 'Next letter', description: 'Each position moves the counts toward leet.' },
    { id: 'done', label: 'Complete', description: 'Report the strings that can be rearranged to contain leet.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String length n (integer 1 to 40)',
  url: 'https://leetcode.com/problems/number-of-strings-which-can-be-rearranged-to-contain-substring/',
  complexity: 'O(n * 12) time for the 12 capped states, and O(1) space. The visualization caps n at 40.',
  examples: [
    { label: 'Length 4', input: '4' },
    { label: 'Length 10', input: '10' },
  ],
}

export default function LeetRearrange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Step">{step.message}</output>
    <p aria-label="Current count">Strings that contain l, e, e, t so far: {step.ways}</p>
  </>} renderReasoning={() => <>
    <p>A string can be rearranged to contain leet exactly when it has at least one l, two e, and one t.</p>
    <p>The counts above the requirement do not matter, so each count is capped, which keeps the state space at 12.</p>
  </>} />
}
