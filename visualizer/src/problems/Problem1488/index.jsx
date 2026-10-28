import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Dry days default to 1 until a lake needs one.' },
    { id: 'dry', label: 'Dry day', description: 'Remember this day as available for a later flood.' },
    { id: 'use', label: 'Use dry day', description: 'Dry the full lake on the earliest dry day after its last rain.' },
    { id: 'rain', label: 'Rain', description: 'Mark the lake as full.' },
    { id: 'fail', label: 'Flood', description: 'No dry day is available, so no plan avoids the flood.' },
    { id: 'done', label: 'Complete', description: 'Report the plan, or an empty answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"rains": [...]} with 0 for a dry day',
  url: 'https://leetcode.com/problems/avoid-flood-in-the-city/',
  complexity: 'Each rain does one binary search over the sorted dry days. The visualization caps input at 12 days.',
  examples: [
    { label: 'Example 1', input: '{"rains":[1,2,3,4]}' },
    { label: 'Example 2', input: '{"rains":[1,2,0,0,2,1]}' },
    { label: 'Flood', input: '{"rains":[1,2,0,1,2]}' },
  ],
}

export default function AvoidFlood() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Plan (-1 rain, 1 default dry, lake number when used)" length={run.input.rains.length} valueAt={i => step.ans[i]} active={step.day ?? -1} />
    <output aria-label="Full lakes">{`Full lakes: ${step.full.length ? step.full.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A dry day can only help a lake that rained before it, so each flood needs a dry day after that lake's last rain.</p>
    <p>Using the earliest such dry day keeps the later dry days free for lakes that need them.</p>
  </>} />
}
