import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last indices', description: 'Record the last occurrence of every letter.' },
    { id: 'extend', label: 'Extend reach', description: 'Push the current part end out to the last occurrence of this letter.' },
    { id: 'cut', label: 'Cut part', description: 'When the index meets the reach, close the part.' },
    { id: 'done', label: 'Complete', description: 'Return the part sizes.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'String s (JSON)',
  url: 'https://leetcode.com/problems/partition-labels/',
  complexity: 'O(n) time, O(26) extra space; the visualization caps the string at 200 characters.',
  examples: [{ label: 'Example 1', input: '"ababcbacadefegdehijhklij"' }, { label: 'Example 2', input: '"eccbbbbdec"' }, { label: 'One letter', input: '"aaaa"' }],
}

export default function PartitionLabels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} active={step.i} valueAt={i => run.input[i]}
      roleAt={i => step.cuts.includes(i) ? 'cut' : i >= step.start && i <= step.end && step.i >= 0 ? 'window' : ''} />
    <StackLane title="Last index of each letter" items={step.last.map(([c, i]) => `${c}:${i}`)} />
    <StackLane title="Part sizes" items={step.sizes} />
    <output aria-label="Window">Current part starts at {step.start}, reach {step.end}</output>
  </>} renderReasoning={({ step }) => <>
    <p>A part may close at i only if no letter inside it occurs later, i.e. the largest last-index of its letters equals i.</p>
    <p>Closing at the earliest such point yields the most parts, because every valid cut is one of these points.</p>
    {step.sizes.length > 0 && <p>Sizes so far: {step.sizes.join(', ')}.</p>}
  </>} />
}
