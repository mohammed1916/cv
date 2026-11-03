import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Range', description: 'Find the smallest and largest values.' },
    { id: 'scan', label: 'Scan', description: 'This integer is already present.' },
    { id: 'missing', label: 'Missing', description: 'This integer is absent, so record it.' },
    { id: 'done', label: 'Result', description: 'Return the recorded integers in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (unique integers)',
  url: 'https://leetcode.com/problems/find-missing-elements/description/',
  complexity: 'O(range) time after building a set; the range is at most the largest value minus the smallest.',
  examples: [
    { label: 'Example', input: '{"nums":[1,4,2,5]}' },
    { label: 'Gap at the start', input: '{"nums":[5,1]}' },
  ],
}

export default function FindMissingElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const lo = Math.min(...run.input.nums)
    const hi = Math.max(...run.input.nums)
    return <>
      <IndexedSequence label="integer" length={hi - lo + 1} valueAt={i => lo + i}
        active={step.at >= 0 ? step.at : -1}
        roleAt={i => (run.input.nums.includes(lo + i) ? 'present' : 'missing')} />
      <output aria-label="Missing so far">{`missing = [${step.missing.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The smallest and largest values fix the full range. Anything in that range that is not in the list is missing.</p>
    <p>A set answers "is this value present?" in constant time, so one pass over the range is enough.</p>
  </>} />
}
