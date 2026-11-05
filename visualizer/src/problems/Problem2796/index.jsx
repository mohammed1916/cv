import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Nothing appended yet.' },
    { id: 'step', label: 'Append', description: 'Add one more copy.' },
    { id: 'done', label: 'Result', description: 'All copies are joined.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with str and a non-negative integer times',
  url: 'https://leetcode.com/problems/repeat-string/',
  complexity: 'O(n * times) with repeated concatenation, where n is the length of the text.',
  examples: [
    { label: 'Three copies', input: '{"str":"ab","times":3}' },
    { label: 'Zero copies', input: '{"str":"xyz","times":0}' },
  ],
}

export default function RepeatString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Copies appended" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
    <output aria-label="Joined result">{`Joined: "${step.out.join('')}"`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each copy is a fixed block. The loop keeps the count, and the count is the only thing that decides how long the result becomes.</p>
  </>} />
}
