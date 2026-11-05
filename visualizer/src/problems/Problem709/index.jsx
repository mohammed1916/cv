import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is shifted yet.' },
    { id: 'shift', label: 'Shift', description: 'An uppercase letter moves 32 code units up.' },
    { id: 'keep', label: 'Keep', description: 'Every other character is copied as it is.' },
    { id: 'done', label: 'Complete', description: 'Return the joined output.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Text (JSON string)',
  url: 'https://leetcode.com/problems/to-lower-case/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Mixed', input: '"Quiet NIGHT, 42!"' },
    { label: 'Symbols', input: '"[ZED]@"' },
  ],
}

export default function ToLowerCase() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input characters (the current one is marked)" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]}
      roleAt={i => (i < step.index ? (/[A-Z]/.test(run.input[i]) ? 'shifted' : 'kept') : '')} />
    <p><strong>Output so far:</strong> <code>{step.out || '(empty)'}</code></p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Uppercase letters A to Z have codes 65 to 90. Adding 32 gives the matching lowercase letter, while all other characters pass through unchanged.</p>
  </>} />
}
