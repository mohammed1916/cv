import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HexTableView from './HexTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1271',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive decimal number as a string (e.g. "257")',
  url: 'https://leetcode.com/problems/hexspeak/description/',
  complexity: 'O(log num) time and O(log num) space for the hex digits. The visualization caps the input at 15 decimal digits so the number stays exact; the draft does not state an exact official bound.',
  examples: [
    { label: 'Hexspeak', input: '"257"' },
    { label: 'Error', input: '"3"' },
    { label: 'Letters kept', input: '"171"' },
  ],
}

export default function Problem1271Hexspeak() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HexTableView run={run} step={step} />}
      renderReasoning={() => (
        <p>The hex digits come from repeated division by 16. Zero and one have speakable letters, and every other digit from 2 to 9 has none, so one such digit decides the answer is ERROR.</p>
      )}
    />
  )
}
