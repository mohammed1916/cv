import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look at each string in turn.' },
    { id: 'shared', label: 'Shared', description: 'This substring also appears in another string, so it is rejected.' },
    { id: 'uncommon', label: 'Uncommon', description: 'This substring appears in no other string.' },
    { id: 'done', label: 'Complete', description: 'Report one answer per string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings (JSON object with arr)',
  url: 'https://leetcode.com/problems/shortest-uncommon-substring-in-an-array/',
  complexity: 'O(n * L^3) for small inputs, where n is the array size and L the string length. The visualization caps arr at 8 strings of 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"arr":["cab","ad","bad","c"]}' },
  ],
}

export default function ShortestUncommonSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Strings" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.index}
      roleAt={i => (i < step.answers.length ? 'answered' : '')} />
    <output aria-label="Current substring">{`Testing: ${step.sub || '(none)'}, answers so far: ${JSON.stringify(step.answers)}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Substrings are tried shortest first and alphabetically within a length, so the first one that appears nowhere else is the answer.</p>
  </>} />
}
