import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the answer equal to num.' },
    { id: 'step', label: 'Operation', description: 'Each operation adds 2 to the largest reachable number.' },
    { id: 'done', label: 'Complete', description: 'Report the largest achievable number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num and t, each from 1 to 50, for example {"num":4,"t":1}',
  url: 'https://leetcode.com/problems/find-the-maximum-achievable-number/',
  complexity: 'O(1) time with the closed form num + 2t. The visualization runs t steps.',
  examples: [
    { label: 'Example 1', input: '{"num":4,"t":1}' },
    { label: 'Example 2', input: '{"num":3,"t":2}' },
  ],
}

export default function MaxAchievable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Largest reachable number after each operation" length={run.input.t} valueAt={index => run.input.num + 2 * (index + 1)} active={step.ops - 1} indexOffset={1} />
    <output aria-label="Answer">{`Operations used: ${step.ops}. Largest achievable: ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation can lower x by one while raising num by one. The gap between x and num closes by two each time.</p>
    <p>Starting from x equal to num, the largest x you can reach is num plus twice t.</p>
  </>} />
}
