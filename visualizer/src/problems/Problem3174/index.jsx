import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Begin with an empty stack of letters.' },
    { id: 'push', label: 'Keep letter', description: 'A letter goes on the stack.' },
    { id: 'pop', label: 'Digit', description: 'A digit removes the letter on top of the stack.' },
    { id: 'done', label: 'Complete', description: 'Report the letters left on the stack.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of letters and digits, for example "ab12c"',
  url: 'https://leetcode.com/problems/clear-digits/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 40 characters.',
  examples: [
    { label: 'Example 1', input: '"cb34"' },
    { label: 'Mixed', input: '"ab12c"' },
  ],
}

export default function ClearDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stack of letters" length={step.stack.length} valueAt={index => step.stack[index]} active={step.stack.length - 1} />
    <output aria-label="Reading">{step.pos >= 0 && step.pos < run.input.length ? `Reading ${run.input[step.pos]} at position ${step.pos}` : step.phase === 'done' ? 'Finished reading' : 'Not started'}</output>
  </>} renderReasoning={() => <>
    <p>The closest letter to the left of a digit is the most recent letter still standing, which is the top of a stack.</p>
    <p>Letters are pushed as they are read. A digit pops once and is never kept, so the stack always holds exactly the surviving letters.</p>
  </>} />
}
