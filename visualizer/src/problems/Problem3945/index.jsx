import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty score.' },
    { id: 'count', label: 'Count digit', description: 'Split off the last digit and count it.' },
    { id: 'done', label: 'Return', description: 'Add each digit times its count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n": n}',
  url: 'https://leetcode.com/problems/digit-frequency-score/',
  complexity: 'O(log n) time and O(1) extra space, since a number has at most ten distinct digits.',
  examples: [
    { label: 'Example 1', input: '{"n":122}' },
    { label: 'Example 2', input: '{"n":101}' },
  ],
}

export default function DigitFrequencyScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Digit counts">{`Counts: ${step.counts.map(([d, f]) => `${d} x${f}`).join(', ') || 'none yet'}`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each digit d that appears f times adds d times f to the score.</p>
    <p>Repeating the copies of a digit one at a time gives the same total, which is why the score equals the digit sum.</p>
  </>} />
}
