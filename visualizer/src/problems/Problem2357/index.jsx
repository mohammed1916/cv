import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no distinct values.' },
    { id: 'new', label: 'New value', description: 'A positive value not seen before.' },
    { id: 'repeat', label: 'Repeat', description: 'A positive value already counted.' },
    { id: 'skip', label: 'Zero', description: 'Zeros need no operation.' },
    { id: 'done', label: 'Result', description: 'The distinct positive count is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (non-negative integers)',
  url: 'https://leetcode.com/problems/make-array-zero-by-subtracting-equal-amounts/',
  complexity: 'O(n) time and O(n) space with a set of positive values.',
  examples: [
    { label: 'Example', input: '{"nums":[1,5,0,3,5]}' },
    { label: 'All zero', input: '{"nums":[0,0,0]}' },
  ],
}

export default function MakeArrayZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (i === step.at && step.phase === 'new' ? 'new' : i === step.at && step.phase === 'repeat' ? 'repeat' : '')} />
    <output aria-label="Distinct positive values">{`seen = {${step.seen.join(', ')}}, count ${step.seen.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Every operation subtracts the smallest positive value from all positive entries, so each distinct positive value needs exactly one operation.</p>
    <p>A set records the distinct positive values, and its size is the answer.</p>
  </>} />
}
