import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single letters', description: 'Each one character needs one turn.' },
    { id: 'cell', label: 'Fill substring', description: 'Try printing the first letter alone or merged with a later match.' },
    { id: 'done', label: 'Complete', description: 'Return the cell for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON string of lowercase letters)',
  url: 'https://leetcode.com/problems/strange-printer/',
  complexity: 'O(n³) time and O(n²) space for the interval table.',
  examples: [
    { label: 'Merge', input: '"aaabbb"' },
    { label: 'Interleaved', input: '"aba"' },
    { label: 'Single', input: '"a"' },
  ],
}

export default function StrangePrinter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title={`Turns for s[i..j] of "${run.input}"`} values={step.table} activeCell={{ row: step.i, column: step.j }}
      rowLabels={run.input.split('').map((c, i) => `${i}${c}`)} columnLabels={run.input.split('').map((c, j) => `${j}${c}`)} />
    <output aria-label="Cell">{step.phase === 'done' ? `Answer: ${step.result}` : `Cell [${step.i}, ${step.j}]`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Merging rule:</strong> if the first letter reappears at k, printing it once for both positions costs the inner part s[i+1..k−1] plus s[k..j].</p>
  </>} />
}
