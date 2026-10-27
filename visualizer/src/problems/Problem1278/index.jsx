import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Costs', description: 'Price each substring by the changes it needs to be a palindrome.' },
    { id: 'cost', label: 'Substring cost', description: 'Count the mismatched mirror pairs in this substring.' },
    { id: 'base', label: 'Base case', description: 'Zero parts cover zero letters at no cost.' },
    { id: 'cell', label: 'Best split', description: 'Choose the cheapest previous cut for this many parts and prefix length.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest changes for k palindromes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with lowercase s and k)',
  url: 'https://leetcode.com/problems/palindrome-partitioning-iii/',
  complexity: 'O(n^3 + k * n^2) time and O(n^2) space. The visualization caps input at 8 letters.',
  examples: [
    { label: 'Three parts', input: '{"s":"abc","k":2}' },
    { label: 'Already split', input: '{"s":"aabbc","k":3}' },
  ],
}

export default function PalindromePartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.table && <DPTable title="best[parts][prefix]: changes for the first letters" values={step.table}
      rowLabels={step.table.map((_, p) => p)} columnLabels={step.table[0].map((_, e) => e)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />}
    <output aria-label="Status">{step.message}</output>
    {step.range && <p aria-label="Substring">{`Substring: ${run.input.s.slice(step.range[0], step.range[1] + 1)}`}</p>}
  </>} renderReasoning={() => <>
    <p>A palindrome compares mirror pairs. Each mismatched pair needs one letter changed, so a substring's price is its count of mismatched pairs.</p>
    <p>The layered table adds one part at a time: the last part starts after some prefix that the earlier parts already cover.</p>
  </>} />
}
