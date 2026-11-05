import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing has been produced yet.' },
    { id: 'yield', label: 'Yield', description: 'next() resumes the generator and it yields the next product.' },
    { id: 'done', label: 'Finished', description: 'The generator has no more values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 4}',
  url: 'https://leetcode.com/problems/factorial-generator/',
  complexity: 'O(n) multiplications in total; each next() call does one multiplication. The visualization caps n at 10.',
  examples: [
    { label: 'Four steps', input: '{"n":4}' },
    { label: 'Zero', input: '{"n":0}' },
  ],
}

export default function FactorialGenerator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values yielded so far" length={step.values.length} valueAt={i => step.values[i]} active={step.values.length - 1}
      roleAt={i => (i === step.values.length - 1 ? 'latest' : '')} />
    <output aria-label="Generator state">{`n = ${run.input.n}; next() yields ${step.ans === null ? 'nothing yet' : step.ans}`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A generator pauses at each yield and keeps its local variables. Each next() call resumes after the last yield, multiplies once, and yields the new product.</p>
    <p>For n = 0 the only value is 1, because the first yield runs before the loop.</p>
  </>} />
}
