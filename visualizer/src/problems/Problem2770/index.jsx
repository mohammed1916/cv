import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Index 0 is reached with no jumps.' },
    { id: 'index', label: 'Best arrival', description: 'Take the best earlier index that can jump here.' },
    { id: 'done', label: 'Complete', description: 'Report the jumps to the last index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers) and target',
  url: 'https://leetcode.com/problems/maximum-number-of-jumps-to-reach-the-last-index/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps input at 10 numbers.',
  examples: [
    { label: 'Target 2', input: '{"nums":[1,3,6,4,1,2],"target":2}' },
    { label: 'Target 0', input: '{"nums":[1,3,6,4,1,2],"target":0}' },
  ],
}

export default function MaxJumps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.i} />
    <IndexedSequence label="Most jumps to reach each index (-1 means unreached)" length={step.jumps.length} valueAt={index => step.jumps[index]} active={step.i} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A jump from j to i is legal when the values differ by at most the target, and it can only go forward.</p>
    <p>Each index is reached in the best way from an earlier reachable index, so the table fills left to right.</p>
  </>} />
}
