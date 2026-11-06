import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1347', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with strings s and t of equal length (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-steps-to-make-two-strings-anagram/',
  complexity: 'O(n + 26) time and O(26) extra space for the letter counts.',
}

export default function AnagramStepsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="String s (index and letter)" length={run.input.s.length} valueAt={i => run.input.s[i]} />
      <IndexedSequence label="String t (index and letter)" length={run.input.t.length} valueAt={i => run.input.t[i]} />
      <RecordStateTable label="Letters of s (count) and how many more t needs" columns={['letter', 'n']} rows={s.counts} activeRow={s.counts.findIndex(r => r.letter === s.letter)} />
      <StackLane title="Changes needed" items={[String(s.steps ?? 0)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Count the mismatch:</strong> a letter of t that s lacks must be made by changing one letter of s, so the answer is the total shortfall.</p>
    <p>{step.message}</p>
  </>} />
}
