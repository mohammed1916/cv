import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Scan', description: 'Count the LCT subsequences already present.' },
    { id: 'gain', label: 'Gain', description: 'Compare the gain from inserting L, T, or C.' },
    { id: 'done', label: 'Complete', description: 'Report the base count plus the best gain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON string of uppercase letters',
  url: 'https://leetcode.com/problems/maximum-number-of-subsequences-after-one-inserting/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '"LMCT"' },
    { label: 'Example 2', input: '"LCCT"' },
  ],
}

export default function MaxSubsequencesAfterInsert() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const chars = [...run.input]
    return <>
      <IndexedSequence label="s" length={chars.length} valueAt={i => chars[i]} active={step.index} />
      <output aria-label="Counts">{`Base LCT: ${step.base}. ${step.gain === null ? '' : `Gain under this option: ${step.gain}.`}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Inserting L at the front creates one new LCT for every CT pair already present. Inserting T at the end is symmetric and uses LC pairs.</p>
    <p>Inserting C is best where the number of L before it times the number of T after it is largest.</p>
  </>} />
}
