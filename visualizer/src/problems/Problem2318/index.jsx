import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No rolls', description: 'Start from the empty sequence, with no last or earlier roll.' },
    { id: 'step', label: 'Add a roll', description: 'Each state adds a roll that is coprime with the last and not within two rolls of a repeat.' },
    { id: 'done', label: 'Complete', description: 'Sum the counts of every state.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, the number of rolls (JSON)',
  url: 'https://leetcode.com/problems/number-of-distinct-roll-sequences/',
  complexity: 'O(n * 6 * 49) time and O(49) space in this trace; the answer is kept modulo 1000000007. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"n":1}' },
    { label: 'Example 2', input: '{"n":2}' },
    { label: 'Example 3', input: '{"n":4}' },
  ],
}

export default function NumberOfDistinctRollSequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Sequences by last roll (rows) and roll before it (columns); 0 means none"
      values={step.table} />
    <output aria-label="Step">{`After ${step.step} of ${run.input.n} rolls`}</output>
  </>} renderReasoning={() => <>
    <p>Two adjacent rolls must have a greatest common divisor of 1, and equal rolls must be more than two apart.</p>
    <p>Only the last two rolls matter for the next roll, so the table tracks those two values and counts the sequences that end that way.</p>
  </>} />
}
