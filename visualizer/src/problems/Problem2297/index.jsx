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
    { label: 'Two indices, zero costs', input: '{"nums":[1,2],"costs":[0,0]}' },
    { label: 'All equal values', input: '{"nums":[5,5,5,5],"costs":[1,1,1,1]}' },
    { label: 'Twelve maximum values', input: '{"nums":[99,0,99,0,99,0,99,0,99,0,99,0],"costs":[0,99,0,99,0,99,0,99,0,99,0,99]}' },
    { label: 'Long run: 12 indices', input: '{"nums":[17,22,55,55,28,71,87,91,3,58,79,73],"costs":[11,34,70,88,87,91,59,83,59,0,29,12]}' },
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
