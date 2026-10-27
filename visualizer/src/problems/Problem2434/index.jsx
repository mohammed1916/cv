import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Begin with an empty stack and empty paper.' },
    { id: 'move', label: 'Move', description: 'Move the next character of s onto t.' },
    { id: 'check', label: 'Compare', description: 'Find the smallest letter still unread in s.' },
    { id: 'print', label: 'Print', description: 'Print the top of t while it is no larger than that letter.' },
    { id: 'done', label: 'Complete', description: 'Report the printed string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of lowercase letters, for example "bdda"',
  url: 'https://leetcode.com/problems/using-a-robot-to-print-the-lexicographically-smallest-string/',
  complexity: 'O(n) time and O(n) space with a letter count. The visualization caps input at 10 letters.',
  examples: [
    { label: 'Example', input: '"bdda"' },
    { label: 'Descending', input: '"zza"' },
  ],
}

export default function RobotSmallestPrint() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Robot stack t" length={step.stack.length} valueAt={index => step.stack[index]} active={step.stack.length - 1} />
    <output aria-label="Paper">{`Paper: ${step.paper || '(empty)'}`}</output>
    <output aria-label="Smallest unread letter">{step.smallest ? `Smallest unread letter: ${step.smallest}` : 'No letter unread in s'}</output>
  </>} renderReasoning={() => <>
    <p>Printing a letter is final, so the robot should print a letter only when no smaller letter can still arrive later.</p>
    <p>A stack top is printed once it is no larger than every letter still unread in s. Otherwise it waits, so a smaller letter can be printed first.</p>
  </>} />
}
