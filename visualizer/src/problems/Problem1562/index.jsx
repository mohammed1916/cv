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
    { label: 'Single element', input: '{"arr":[1],"m":1}' },
    { label: 'Already in order', input: '{"arr":[1,2,3,4],"m":2}' },
    { label: 'Largest: 50 values, reversed', input: '{"arr":[50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],"m":50}' },
    { label: 'Long run: 50 values', input: '{"arr":[5,31,37,41,26,18,12,36,32,1,9,19,49,35,23,28,29,34,22,13,33,25,4,14,42,30,39,48,50,17,8,21,20,6,43,7,16,38,27,47,24,15,46,11,45,44,10,40,2,3],"m":25}' },
  ],
}

export default function FindLatestGroupOfSizeM() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary string" length={run.input.arr.length} valueAt={i => step.bits[i]} active={step.active}
      roleAt={i => {
        if (step.left === undefined || step.pos === undefined) return step.bits[i] === 1 ? 'on' : ''
        const runStart = step.pos - step.left - 1, runEnd = step.pos + step.right - 1
        if (i === runStart) return 'l'
        if (i === runEnd) return 'r'
        if (i > runStart && i < runEnd) return 'window'
        return step.bits[i] === 1 ? 'on' : ''
      }} />
    <p>Step {step.step ?? 0} · groups of length m: {step.groupsOfM} · last: {step.last}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
