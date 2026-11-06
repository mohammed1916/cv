import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitWindowView from './DigitWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Check every index in turn.' },
    { id: 'check', label: 'Compare', description: 'Compare the digits ending at i with i written out.' },
    { id: 'match', label: 'Good', description: 'The digits match, so i is recorded.' },
    { id: 'done', label: 'Result', description: 'Report the good indices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (digits, up to 30)',
  url: 'https://leetcode.com/problems/good-indices-in-a-digit-string/',
  complexity: 'O(n * L) time for a string of length n, where L is the digit count of the largest index. The visualization caps s at 30 digits.',
  examples: [
    { label: 'Zero and one', input: '{"s":"0110"}' },
    { label: 'Two digit index', input: '{"s":"01234567810"}' },
  ],
}

export default function GoodIndicesInADigitString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="digits" length={run.input.s.length} valueAt={i => run.input.s[i]} roleAt={i => i === step.index ? 'r' : step.start >= 0 && i === step.start ? 'l' : ''} /><DigitWindowView run={run} step={step} /></>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Index i is checked by reading only the characters that would end at position i, with the same length as its decimal text.</p>
    {run ? <p>Final answer: {run.result.length ? run.result.join(', ') : 'no good indices'}.</p> : null}
  </>} />
}
