import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2024',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Answer key of T and F, and k (JSON)',
  url: 'https://leetcode.com/problems/maximize-the-confusion-of-an-exam/',
  complexity: 'O(n) time for each of the two letters, with a sliding window and O(1) extra space.',
  examples: [
    { label: 'Three of one', input: '{"answerKey":"TFTFT","k":1}' },
    { label: 'Two flips', input: '{"answerKey":"FFFTFT","k":2}' },
    { label: 'No flips', input: '{"answerKey":"TTFF","k":0}' },
  ],
}

export default function MaximizeConfusion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { answerKey, k, letter, l, r, flips, best, bestWindow, bestLetter } = step.snapshot
    return <>
      <IndexedSequence label={`Answer key, window for ${letter}`} length={answerKey.length} valueAt={i => answerKey[i]} active={r >= 0 ? r : 0}
        roleAt={i => (i === l && l >= 0 ? 'l' : '') + (i === r && r >= 0 && i !== l ? 'r' : '')} />
      <p>Window from <strong>l = {l}</strong> to <strong>r = {r}</strong> needs <strong>{flips}</strong> flip(s); the budget is <strong>{k}</strong>.</p>
      <p>Best run so far: <strong>{best}</strong>{bestLetter ? ` of ${bestLetter}, positions ${bestWindow[0]} to ${bestWindow[1]}` : ''}.</p>
    </>
  }} renderReasoning={() => <p>For a fixed answer letter, the window is valid while the number of other letters inside it stays within k. Growing r and shrinking l keeps the longest valid window in one pass.</p>} />
}
