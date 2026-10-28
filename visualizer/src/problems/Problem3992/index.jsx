import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pick', label: 'y letter', description: 'Move this y into the front group.' },
    { id: 'keep', label: 'Other letter', description: 'Keep this letter in the rest of the string.' },
    { id: 'done', label: 'Complete', description: 'Show the rearranged string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String and letters (JSON object with s, x and y)',
  url: 'https://www.talentd.in/fleetcode/problems/rearrange-string-to-avoid-character-pair',
  complexity: 'O(n) time and O(n) space. The visualization caps s at 16 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aabc","x":"a","y":"c"}' },
    { label: 'Example 2', input: '{"s":"dcab","x":"d","y":"b"}' },
  ],
}

export default function RearrangeAvoidPair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} />
    <output aria-label="Result">{`Result so far: ${step.phase === 'done' ? buildResult(run) : 'in progress'}`}</output>
  </>} renderReasoning={() => <>
    <p>Putting every y in front of all other letters makes every y come before every x.</p>
    <p>The other letters keep their order, so the result uses exactly the same characters as s.</p>
  </>} />
}

function buildResult(run) {
  return run.result
}
