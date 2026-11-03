import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ArcJumpView from './ArcJumpView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Index 0 is free and begins both stacks.' },
    { id: 'scan', label: 'Land', description: 'Pick the next index to reach.' },
    { id: 'peak', label: 'Rising', description: 'A rising jump from a peak is legal.' },
    { id: 'valley', label: 'Falling', description: 'A falling jump from a valley is legal.' },
    { id: 'store', label: 'Store', description: 'Keep the cheapest total and push the index.' },
    { id: 'done', label: 'Result', description: 'The cost to reach the last index.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and costs lists, e.g. {"nums":[3,1,4],"costs":[2,9,1]}',
  url: 'https://leetcode.com/problems/jump-game-viii/',
  complexity: 'O(n) time and space: each index is pushed onto each stack once and popped at most once. The visualization caps the list at 12 entries with values and costs from 0 to 99; this draft does not state official bounds.',
  examples: [
    { label: 'Mixed climb', input: '{"nums":[3,1,4,1,5],"costs":[2,9,1,4,6]}' },
    { label: 'Descending', input: '{"nums":[9,7,5,2],"costs":[4,1,8,3]}' },
    { label: 'Flat then rise', input: '{"nums":[2,2,6,3,7],"costs":[5,0,2,9,1]}' },
  ],
}

export default function JumpGameVIII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ArcJumpView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Two stacks hold every index that can still reach the future. A peak stack keeps indices that beat everything after them; a valley stack keeps indices that stay at or below everything after them.</p>
    </>} />
}
