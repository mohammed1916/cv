import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the rank of the whole string at zero.' },
    { id: 'position', label: 'Position', description: 'Count the arrangements that place a smaller letter here.' },
    { id: 'done', label: 'Complete', description: 'Report the operations count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with lowercase s)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-string-sorted/',
  complexity: 'O(n * 26 * n) time for the multinomial counts. The visualization caps input at 8 letters.',
  examples: [
    { label: 'Descending', input: '{"s":"cba"}' },
    { label: 'Repeated letters', input: '{"s":"aabaa"}' },
  ],
}

export default function SortingOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} active={step.index}
      valueAt={i => run.input.s[i]}
      roleAt={i => (i < step.index ? 'counted' : i === step.index ? 'current' : 'waiting')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each operation moves the string one step back in the list of its arrangements, so the number of operations is how many arrangements sort before it.</p>
    <p>Placing a smaller letter at the current position leaves a fixed set of letters to arrange, and that count is a multinomial coefficient.</p>
  </>} />
}
