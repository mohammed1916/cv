import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1328', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with a palindrome text (JSON)',
  url: 'https://leetcode.com/problems/break-a-palindrome/',
  complexity: 'O(n) time and O(n) space for the character array.',
}

export default function BreakPalindromeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <IndexedSequence label="Characters" length={run.input.length} valueAt={i => s.s[i]} active={s.l ?? -1}
      roleAt={i => (s.l !== null && s.l !== undefined && i === s.l ? 'l' : s.r !== null && s.r !== undefined && i === s.r ? 'r' : '')} />
  }} renderReasoning={({ step }) => <>
    <p><strong>Left half first:</strong> changing a letter to a in the left half gives the smallest result. Only the left half is scanned, because the right half mirrors it.</p>
    <p>{step.message}</p>
  </>} />
}
