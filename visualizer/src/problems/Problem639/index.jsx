import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'One way to decode nothing.' },
    { id: 'extend', label: 'Extend prefix', description: 'Add the one-digit and two-digit readings.' },
    { id: 'done', label: 'Complete', description: 'Read the full count.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Encoded string (JSON string)',
  url: 'https://leetcode.com/problems/decode-ways-ii/',
  complexity: 'O(n) time and O(n) space for this visualization, which keeps the full prefix table. The solver itself can use O(1) space.',
  examples: [
    { label: 'Star', input: '"*"' },
    { label: 'One star one digit', input: '"1*"' },
    { label: 'Two stars', input: '"**"' },
    { label: 'Zero', input: '"06"' },
  ],
}

export default function DecodeWaysII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Prefix counts (ways[i] for the first i characters of "${run.input}")`} length={run.ways.length} active={step.index}
      valueAt={i => step.ways[i]} roleAt={i => (i === step.index ? 'current' : '')} />
    <output aria-label="Decoding count">Ways for prefix {step.index}: {step.ways[step.index]}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Two readings per position:</strong> the last character alone (1–9 for '*', 0 is invalid alone) and, with the previous character, a number 10–26.</p>
    <p>{run.input.includes('*') ? 'Stars multiply the readings: "**" has 15 two-digit readings (11–19, 21–26).' : ''}</p>
  </>} />
}
