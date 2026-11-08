import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'Substrings are filled from short to long, bottom-up.' },
    { id: 'cell', label: 'Start from one turn', description: 'Printing the first character alone is the baseline.' },
    { id: 'merge', label: 'Merge a match', description: 'A later equal character can join the first one’s turn.' },
    { id: 'store', label: 'Store the cell', description: 'Keep the cheapest choice for this substring.' },
    { id: 'done', label: 'Answer', description: 'The whole string is the top-right corner.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Target string (JSON string of lowercase letters)',
  url: 'https://leetcode.com/problems/strange-printer/',
  complexity: 'O(n³) time and O(n²) space for the interval table.',
  examples: [
    { label: 'Interleaved', input: '"abcab"' },
    { label: 'Mirror', input: '"xyzyx"' },
    { label: 'Repeats', input: '"zzyz"' },
    { label: 'One letter', input: '"a"' },
    { label: 'Repeats print once', input: '"aaaa"' },
    { label: 'Longest alphabet cycle', input: '"abcdefghijklmnopqrstuvwxyzabcd"' },
    { label: 'Long run: 30 letters', input: '"baacccabcbabbacacacacabbbbcaab"' },
  ],
}

export default function StrangePrinter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const labels = [...run.input]
    const active = step.i !== null && step.j !== null ? { row: step.i, column: step.j } : null
    const related = []
    if (step.phase === 'cell') related.push({ row: step.i + 1, column: step.j })
    if (step.phase === 'merge') related.push({ row: step.i + 1, column: step.k - 1 }, { row: step.k, column: step.j })
    if (step.phase === 'store' && step.k !== null) related.push({ row: step.i + 1, column: step.k - 1 }, { row: step.k, column: step.j })
    return <>
      <DPTable title="Turns to print s[i..j]" values={step.dp} rowLabels={labels} columnLabels={labels}
        activeCell={active} relatedCells={related} />
      <output aria-label="Current cell">{step.phase === 'done' ? `Fewest turns: ${step.result}` : active ? `Cell [${step.i}, ${step.j}] = ${step.dp[step.i][step.j]}` : 'Filling from short to long'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why an interval table:</strong> a turn prints one contiguous block, so the best plan for s[i..j] splits cleanly at a matching character.</p>
  </>} />
}
