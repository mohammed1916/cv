import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no combination.' },
    { id: 'count', label: 'Count bit', description: 'Count the candidates that have this bit set.' },
    { id: 'record', label: 'New best', description: 'This bit gives a larger combination.' },
    { id: 'done', label: 'Complete', description: 'Report the largest count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with candidates: 1 to 30 positive integers, e.g. {"candidates":[16,17,71]}',
  url: 'https://leetcode.com/problems/largest-combination-with-bitwise-and-greater-than-zero/',
  complexity: 'O(20 * n) time and O(1) extra space. The visualization caps the input at 30 candidates.',
  examples: [
    { label: 'Example 1', input: '{"candidates":[16,17,71,62,12,24,14]}' },
    { label: 'Example 2', input: '{"candidates":[8,8]}' },
  ],
}

export default function LargestCombinationAnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { candidates } = run.input
    const roleOf = index => (step.bit >= 0 && (candidates[index] >> step.bit) & 1 ? 'has bit' : '')
    return <>
      <IndexedSequence label={`Candidates, bit ${step.bit < 0 ? '-' : step.bit}`} length={candidates.length}
        valueAt={i => candidates[i].toString(2)} active={-1} roleAt={roleOf} />
      <output aria-label="Best combination">{`Best so far: ${step.best} candidates${step.bestBit >= 0 ? ` (bit ${step.bestBit})` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A combination's AND is nonzero when every member shares at least one set bit. Choosing all numbers that have one bit set guarantees this.</p>
    <p>So the answer is the largest count of candidates sharing one bit position.</p>
  </>} />
}
