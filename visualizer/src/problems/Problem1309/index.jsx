import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1309', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with a string s (JSON)',
  url: 'https://leetcode.com/problems/decrypt-string-from-alphabet-to-integer-mapping/',
  complexity: 'O(n) time and O(n) space for the collected letters.',
}

export default function AlphabetDecodeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Characters of s" length={run.input.length} valueAt={i => run.input[i]} active={s.index ?? -1}
        roleAt={i => (s.group && i >= s.group.from && i <= s.group.to ? 'group' : '')} />
      <StackLane title="Letters collected (right to left)" items={s.letters} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Read from the right:</strong> a # always ends a two-digit group, so the scan has to see it first.</p>
    <p>{step.message}</p>
  </>} />
}
