import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read from the first bit.' },
    { id: 'one', label: 'One-bit character', description: 'A 0 stands alone.' },
    { id: 'two', label: 'Two-bit character', description: 'A 1 consumes the next bit.' },
    { id: 'last', label: 'Last bit', description: 'Check how the final bit is used.' },
    { id: 'done', label: 'Complete', description: 'Report the last character type.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Bits (JSON array of 0 and 1)',
  url: 'https://leetcode.com/problems/1-bit-and-2-bit-characters/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'One-bit last', input: '[1,0,0]' },
    { label: 'Two-bit last', input: '[1,1,1,0]' },
    { label: 'Single zero', input: '[0]' },
  ],
}

export default function OneTwoBitCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bits" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => (step.phase === 'two' && (i === step.index || i === step.index + 1) ? 'written' : i === step.index ? 'current' : '')} />
    <output aria-label="Last character">{step.phase === 'done' ? `Last character is ${step.result ? 'one' : 'two'} bit${step.result ? '' : 's'}` : 'Parsing…'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy parse:</strong> the parse from the left is forced, so the last character is determined by where the walk lands.</p>
  </>} />
}
