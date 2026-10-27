import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Split the string into two equal halves.' },
    { id: 'count', label: 'Count', description: 'Count the question marks and sum the known digits on each side.' },
    { id: 'parity', label: 'Parity', description: 'An odd number of question marks lets Alice make the last move.' },
    { id: 'compare', label: 'Compare', description: 'Check whether the sums can be made to differ.' },
    { id: 'done', label: 'Complete', description: 'Report the result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num, for example {"num":"25??"}',
  url: 'https://leetcode.com/problems/sum-game/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"num":"5023"}' },
    { label: 'Example 2', input: '{"num":"25??"}' },
    { label: 'Example 3', input: '{"num":"?3295???"}' },
  ],
}

export default function SumGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const half = run.input.num.length / 2
    return <>
      <IndexedSequence label="Characters" length={run.input.num.length} valueAt={i => run.input.num[i]} roleAt={i => (i < half ? 'left' : 'right')} />
      <output aria-label="Counts">{step.stats ? `Left: ${step.stats.cl} ?, sum ${step.stats.sl} · Right: ${step.stats.cr} ?, sum ${step.stats.sr}` : 'Counts appear after the split.'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Alice fills one question mark per turn and Bob fills another. If the count of question marks is odd, Alice makes the final move and can always make the halves differ.</p>
    <p>If the count is even, Bob can answer each move, and the only remaining question is whether the fixed sums can be pushed to equal; the formula compares the two halves directly.</p>
  </>} />
}
