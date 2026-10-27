import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counts', description: 'Start with the given numbers of a, b and c.' },
    { id: 'add', label: 'Add a letter', description: 'Choose the most plentiful letter that is allowed next.' },
    { id: 'stuck', label: 'Stuck', description: 'No allowed letter remains.' },
    { id: 'done', label: 'Complete', description: 'Every letter is used.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'a, b and c (JSON)',
  url: 'https://leetcode.com/problems/longest-happy-string/',
  complexity: 'O(a + b + c) steps with a constant number of letters to compare. The visualization caps each count at 100.',
  examples: [
    { label: 'Mixed', input: '{"a":1,"b":1,"c":7}' },
    { label: 'Impossible', input: '{"a":0,"b":0,"c":3}' },
  ],
}

export default function StringWithoutTriples() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="String so far" items={[...step.s]} note={`a ${step.left.a} · b ${step.left.b} · c ${step.left.c} left`} />
    <output aria-label="Message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Taking the most plentiful letter keeps the counts balanced, so no letter runs out early and leaves a long block of one letter.</p>
    <p>The only exception is a run of two equal letters, which forces the next choice to a different letter.</p>
  </>} />
}
