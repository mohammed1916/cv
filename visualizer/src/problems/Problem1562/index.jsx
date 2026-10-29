import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start with an all-zero string and no runs.' },
    { id: 'loop', label: 'Flip', description: 'Turn on the bit at the next position in arr.' },
    { id: 'merge', label: 'Merge runs', description: 'Read the runs on each side and merge them through the new bit.' },
    { id: 'count', label: 'Count m', description: 'Update how many runs of exactly length m exist.' },
    { id: 'check', label: 'Record', description: 'Record the step if a run of length m exists.' },
    { id: 'done', label: 'Result', description: 'Return the latest recorded step.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Permutation and m (JSON object with arr and m)',
  url: 'https://leetcode.com/problems/find-latest-group-of-size-m/',
  complexity: 'O(n) time and O(n) space for a permutation of length n. The visualization caps input at 50 bits.',
  examples: [
    { label: 'Size 1', input: '{"arr":[3,5,1,2,4],"m":1}' },
    { label: 'Size 2 never', input: '{"arr":[3,1,5,4,2],"m":2}' },
  ],
}

export default function FindLatestGroupOfSizeM() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary string" length={run.input.arr.length} valueAt={i => step.bits[i]} active={step.active}
      roleAt={i => (step.bits[i] === 1 ? 'on' : '')} />
    <p>Step {step.step ?? 0} · groups of length m: {step.groupsOfM} · last: {step.last}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
