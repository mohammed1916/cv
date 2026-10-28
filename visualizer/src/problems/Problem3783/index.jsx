import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty reversed number.' },
    { id: 'digit', label: 'Digit', description: 'Move the last digit of n onto the end of the reversed number.' },
    { id: 'done', label: 'Complete', description: 'Take the absolute difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n from 1 to 100000, for example {"n":25}',
  url: 'https://leetcode.com/problems/mirror-distance-of-an-integer/',
  complexity: 'O(d) time for d digits.',
  examples: [
    { label: 'Example 1', input: '{"n":25}' },
    { label: 'Example 2', input: '{"n":10}' },
  ],
}

export default function MirrorDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={run.digits.length} valueAt={index => run.digits[index]} active={step.position ?? -1} />
    <output aria-label="Reversed">{`Reversed so far: ${step.reversed}`}</output>
  </>} renderReasoning={() => <>
    <p>Reversing a number takes its digits from the last one up. Dividing by ten drops the last digit, and multiplying the reversed value by ten makes room for it.</p>
    <p>The mirror distance is the absolute difference between n and its reverse.</p>
  </>} />
}
