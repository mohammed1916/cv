import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the string left to right.' },
    { id: 'shift', label: 'Shift letter', description: 'Add 32 to an uppercase code.' },
    { id: 'keep', label: 'Keep', description: 'Leave other characters unchanged.' },
    { id: 'done', label: 'Complete', description: 'Return the lowercase string.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON string)',
  url: 'https://leetcode.com/problems/to-lower-case/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Hello', input: '"Hello"' },
    { label: 'Mixed', input: '"here"' },
    { label: 'Symbols', input: '"LOVELY"' },
  ],
}

export default function ToLowerCase() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (i === step.index ? step.phase : '')} />
    <IndexedSequence label="Output so far" length={run.input.length} active={step.index} valueAt={i => step.out[i] ?? '·'} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>ASCII arithmetic:</strong> the gap between 'A' and 'a' is exactly 32, which is why adding 32 works for letters and leaves everything else untouched.</p>
  </>} />
}
