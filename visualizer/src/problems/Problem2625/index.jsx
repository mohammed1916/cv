import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty output and the depth limit.' },
    { id: 'enter', label: 'Descend', description: 'A list is shallower than the limit, so its items are walked one level deeper.' },
    { id: 'emit', label: 'Emit', description: 'Append an integer, or a list at or past the limit, unchanged.' },
    { id: 'done', label: 'Complete', description: 'Report the flattened output.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with arr (nested lists of integers) and n (depth limit)',
  url: 'https://leetcode.com/problems/flatten-deeply-nested-array/',
  complexity: 'O(size of the nested input) time and O(output) space for the walk.',
  examples: [
    { label: 'Limit 1', input: '{"arr":[4,[5,[6,7]],[8]],"n":1}' },
    { label: 'Limit 0', input: '{"arr":[4,[5,[6,7]],[8]],"n":0}' },
    { label: 'Limit 2', input: '{"arr":[[1,2],[3,[9,4]],[5]],"n":2}' },
  ],
}

export default function FlattenDeeplyNestedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Output so far" length={step.result.length} valueAt={index => JSON.stringify(step.result[index])}
      active={step.result.length - 1} roleAt={index => index === step.result.length - 1 && step.phase === 'emit' ? 'just added' : ''} />
    <output aria-label="Current position">{step.path ? `Position ${step.path}, depth ${step.depth ?? '-'}, depth limit ${run.input.n}` : `Depth limit ${run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>Each list is walked one level deeper only while its depth is less than the limit n. Top-level items have depth 0.</p>
    <p>A list at or past the limit is appended as it is, which is why a limit of 0 returns the input unchanged.</p>
  </>} />
}
