import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LetterParityView from './LetterParityView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Parity', description: 'Every letter starts even.' },
    { id: 'digit', label: 'Digit', description: 'Spell the next digit.' },
    { id: 'letter', label: 'Letter', description: 'Flip the parity of one letter.' },
    { id: 'done', label: 'Result', description: 'Count the odd letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A whole number written as digits (for example 4096)',
  url: 'https://leetcode.com/problems/count-odd-letters-from-number/',
  complexity: 'O(d) time for d digits, since each spelled word has at most five letters, and O(1) space for the 26 parities. The visualization accepts up to nine digits.',
  examples: [
    { label: 'Four digits', input: '4096' },
    { label: 'Mixed digits', input: '70271' },
  ],
}

export default function CountOddLettersFromNumber() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <LetterParityView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Flipping a parity twice cancels out, so one boolean per letter is enough to track odd totals.</p>
    </>} />
}
