import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero characters have one decoding.' },
    { id: 'extend', label: 'Extend prefix', description: 'Add a one-character reading and, when possible, a two-character reading.' },
    { id: 'done', label: 'Answer', description: 'The count for the whole string, modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Encoded message (JSON string of digits and *)',
  url: 'https://leetcode.com/problems/decode-ways-ii/',
  complexity: 'O(n) time and O(1) extra space for the recurrence; the trace keeps the whole table for display.',
  examples: [
    { label: 'Star alone', input: '"*"' },
    { label: 'Star after one', input: '"1*"' },
    { label: 'Mixed', input: '"2*3"' },
    { label: 'Single digit', input: '"7"' },
    { label: 'Two zeros', input: '"00"' },
    { label: 'Stars make pairs', input: '"**"' },
    { label: 'Longest star run', input: '"************************************************************************************************************************************************************************************************************************************************************************************************************"' },
    { label: 'Long run: 120 characters', input: '"3285203*120032*190792820422592*1077386952196986977900484280883*27353917*87610*7516369454*5**6593312*78352476462815370*84"' },
  ],
}

export default function DecodeWaysII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const i = step.index
    const related = step.phase === 'extend' ? [{ row: 1, column: i - 1 }, ...(i >= 2 ? [{ row: 1, column: i - 2 }] : [])] : []
    return <>
      <DPTable title="Ways to decode each prefix" values={[['', ...run.input.split('')], step.ways.map(Number)]}
        rowLabels={['chars', 'ways']} columnLabels={step.ways.map((_, k) => k)}
        activeCell={step.phase === 'start' ? null : { row: 1, column: i }} relatedCells={related} />
      <output aria-label="Current prefix">{step.phase === 'start' ? 'Empty prefix' : `Prefix length ${i}: ${step.ways[i]} decodings`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two readings:</strong> the last character can stand alone, and the last two characters can form one letter. A star has nine single readings and up to fifteen pair readings.</p>
  </>} />
}
