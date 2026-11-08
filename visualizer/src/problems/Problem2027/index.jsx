import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2027',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of X and O (JSON)',
  url: 'https://leetcode.com/problems/minimum-moves-to-convert-string/',
  complexity: 'O(n) time: each move skips three positions.',
  examples: [
    { label: 'Scattered', input: '{"s":"XOXOXOX"}' },
    { label: 'Two blocks', input: '{"s":"XXXOXXX"}' },
    { label: 'All O', input: '{"s":"OOO"}' }, { label: "Single X", input: "{\"s\":\"X\"}" }, { label: "All X", input: "{\"s\":\"XXXXXXXXXX\"}" }, { label: "Longest alternating", input: "{\"s\":\"XOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXOXO\"}" }, { label: "Long run: 60 cells", input: "{\"s\":\"XOOXOOXXOOXOXXOOOXOXXOXXXOXXOXXXXXOXOOXXOXXXXOXOOOXXXXOXXXOO\"}" },
  ],
}

export default function MinimumMovesToConvertString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, l, r, moves } = step.snapshot
    return <>
      <IndexedSequence label="Characters" length={s.length} valueAt={i => s[i]} active={r >= 0 ? r : l}
        roleAt={i => (i === l && l >= 0 ? 'l' : '') + (i === r && r >= 0 && r !== l ? ' r' : '')} />
      <p>{l >= 0 && r >= 0 ? <>Window from <strong>l = {l}</strong> to <strong>r = {r}</strong> is converted in one move.</> : 'Scanning for the next X.'} Moves so far: <strong>{moves}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Each move covers three consecutive characters, so the leftmost unconverted X should start a window and the scan then resumes after that window.</p>} />
}
