import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Base cases', description: 'Width 0, 1 and 2 have known counts.' },
    { id: 'step', label: 'Recurrence', description: 'Each width reads the two earlier widths it depends on.' },
    { id: 'done', label: 'Complete', description: 'Return the count for width n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n (JSON integer)',
  url: 'https://leetcode.com/problems/domino-and-tromino-tiling/',
  complexity: 'O(n) time and O(n) space with the table; O(1) space is also possible.',
  examples: [
    { label: 'Width four', input: '4' },
    { label: 'Width seven', input: '7' }, { label: 'Width one', input: '1' }, { label: 'Width two', input: '2' }, { label: 'Long run: width 60', input: '60' },
  ],
}

export default function DominoTromino() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={`Tilings by width (target width ${run.input})`} columns={['width', 'tilings', 'reads']}
      rows={step.dp.map((v, w) => ({ width: w, tilings: v, reads: step.reads.includes(w) ? 'read now' : '' }))}
      activeRow={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A tiling of width i ends in a full-height domino, a pair of L-trominoes that together fill width three, or a larger block. The counts satisfy dp[i] = 2·dp[i-1] + dp[i-3].</p>
    <p>Values are reduced modulo 1,000,000,007 as the problem requires.</p>
  </>} />
}
