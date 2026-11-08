import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The first character starts at bit 0.' },
    { id: 'two', label: 'Two-bit', description: 'A leading 1 takes the next bit with it.' },
    { id: 'one', label: 'One-bit', description: 'A leading 0 is a character on its own.' },
    { id: 'done', label: 'Result', description: 'Check whether the walk ends on the final bit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Bits (JSON array of 0 and 1)',
  url: 'https://leetcode.com/problems/1-bit-and-2-bit-characters/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Ends alone', input: '[1,1,0,0]' },
    { label: 'Pair ends', input: '[0,1,1,0]' },
    { label: 'Pairs only', input: '[1,0,1,1,1,0]' },
    { label: 'Single bit', input: '[1]' },
    { label: 'Equal bits in a row', input: '[1,1,1,1]' },
    { label: 'Zeros only', input: '[0,0]' },
    { label: 'Long run: 1000 bits', input: '[0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,0,0,1,1,1,1,1,0,0,1,1,0,0,1,0,0,1,1,1,0,1,0,0,1,0,1,0,0,0,1,0,0,1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,1,0,1,0,1,0,0,0,1,0,0,1,1,0,1,1,1,1,0,1,1,0,1,0,0,1,0,0,0,0,1,0,0,1,1,1,0,1,0,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,0,1,0,0,0,1,0,1,0,1,1,0,0,1,0,1,1,0,0,1,1,1,0,0,1,1,0,1,1,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,1,1,0,1,1,1,0,0,1,0,0,1,1,0,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,1,0,1,1,1,1,0,1,0,1,0,1,1,0,0,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,1,0,0,0,1,1,1,1,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,1,1,0,0,1,1,1,1,0,1,1,1,0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,1,1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,1,0,1,1,0,0,1,1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1,1,0,1,1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,0,1,1,0,0,1,0,0,0,0,1,1,1,0,0,0,1,1,0,1,0,1,0,0,0,0,0,1,1,0,1,1,1,1,1,0,0,1,0,1,0,0,0,0,1,1,0,0,1,0,1,1,1,0,1,0,0,0,0,0,0,1,0,0,1,1,0,0,1,0,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,0,0,1,1,1,1,1,0,0,1,0,1,0,1,1,1,1,1,0,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,1,0,0,1,1,0,0,1,1,0,0,0,0,1,1,1,0,1,0,1,0,1,1,1,1,1,0,0,0,0,1,1,1,0,1,1,0,1,0,0,1,1,1,0,1,0,0,1,0,0,0,1,1,0,0,1,1,1,1,0,1,1,1,1,1,0,0,1,0,0,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,1,0,1,1,0,0,1,0,1,1,0,0,0,0,1,1,1,0,1,1,0,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,0,1,0,1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,1,0,1,0,1,0,0,1,0,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,1,0,0,0,1,0,0,1,0,0,1,1,1,0,0,0,1,0,0,0,1,1,1,0,0,0,0,1,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,1,1,0,0,1,0,0,0,0,0,1,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,1,0,1,1]' },
  ],
}

export default function OneBitTwoBit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bits (the character starts are marked)" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]}
      roleAt={i => (step.covers?.includes(i) ? 'covered' : step.starts?.includes(i) ? 'start' : i === run.input.length - 1 ? 'last bit' : '')} />
    <output aria-label="Result">{step.phase === 'done' ? `Last character is one bit: ${step.result}` : `Walk index ${step.index}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Walk from the left. A 0 is a one-bit character and moves the walk by one. A 1 is the start of a two-bit character and moves it by two.</p>
    <p>The last character is one bit exactly when the walk stops on the final bit. A jump past it means the final character used two bits.</p>
    {step.phase === 'done' && <p>{step.message}</p>}
  </>} />
}
