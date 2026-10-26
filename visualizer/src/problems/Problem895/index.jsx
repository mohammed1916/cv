import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Create', description: 'Empty maps and maxfreq = 0.' },
    { id: 'push', label: 'Count value', description: 'Increase the pushed value frequency.' },
    { id: 'place', label: 'Place on level', description: 'Push onto the stack for its new frequency.' },
    { id: 'pop', label: 'Pop top level', description: 'Remove the top of the highest-frequency stack.' },
    { id: 'shrink', label: 'Update', description: 'Lower the frequency and maybe maxfreq.' },
    { id: 'done', label: 'Complete', description: 'All operations processed.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Operations (LeetCode JSON: names, args)',
  url: 'https://leetcode.com/problems/maximum-frequency-stack/',
  complexity: 'O(1) per push and pop; O(n) space for the level stacks.',
  examples: [
    { label: 'Official', input: '[["FreqStack","push","push","push","push","push","push","pop","pop","pop","pop"],[[],[5],[7],[5],[7],[4],[5],[],[],[],[]]]' },
    { label: 'Tie by recency', input: '[["FreqStack","push","push","push","pop","pop","pop"],[[],[1],[2],[3],[],[],[]]]' },
    { label: 'Repeated value', input: '[["FreqStack","push","push","push","pop","push","pop"],[[],[9],[9],[3],[],[3],[]]]' },
  ],
}

export default function MaximumFrequencyStack() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <OperationLog title="Operations" ops={step.log} current={step.current >= 0 ? step.log.length - 1 : -1} />
      <IndexedSequence label="Frequency of each value (value → count)" length={step.freq.length} valueAt={i => `${step.freq[i][0]} → ${step.freq[i][1]}`} active={-1} />
      {step.groups.map(([f, items]) => <StackLane key={f} title={`Level ${f}`} items={items} note={f === step.maxfreq ? 'maxfreq' : undefined} />)}
      <output aria-label="Max frequency">maxfreq = {step.maxfreq}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Why per-frequency stacks?</strong> A value pushed for the k-th time goes on level k, so level k is ordered by when values reached count k. The highest non-empty level holds exactly the most frequent values, and its top is the most recent of them.</p>
    </>} />
}
