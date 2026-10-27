import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single letters', description: 'Every single letter is already a palindrome.' },
    { id: 'match', label: 'Ends match', description: 'The ends agree, so only the inside matters.' },
    { id: 'differ', label: 'Ends differ', description: 'The ends disagree, so one insertion is needed beside one of them.' },
    { id: 'done', label: 'Complete', description: 'Report the insertions for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with lowercase s)',
  url: 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/',
  complexity: 'O(n^2) time and space. The visualization caps input at 10 letters.',
  examples: [
    { label: 'Mostly there', input: '{"s":"mbadm"}' },
    { label: 'Already close', input: '{"s":"zzazz"}' },
  ],
}

export default function PalindromeInsertions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="best[i][j]: insertions for substring i to j" values={step.table}
      rowLabels={run.input.s.split('')} columnLabels={run.input.s.split('')}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>When the two ends of a substring match, they can sit around a palindrome for free, so the answer is the inside's answer.</p>
    <p>When they differ, either insertion next to one end makes the ends match, so the answer is one more than the better of the two shorter substrings.</p>
  </>} />
}
