import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The starting binary string.' },
    { id: 'swap', label: 'Swap', description: 'Every 01 pair becomes 10 at the same time.' },
    { id: 'done', label: 'Complete', description: 'Report the number of seconds.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (binary string)',
  url: 'https://leetcode.com/problems/time-needed-to-rearrange-a-binary-string/',
  complexity: 'O(n * seconds) for the simulation; a running pass gives O(n). The visualization caps s at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"0110101"}' },
    { label: 'Example 2', input: '{"s":"11100"}' },
  ],
}

export default function RearrangeBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`String after ${step.seconds} second${step.seconds === 1 ? '' : 's'}`} length={step.s.length}
      valueAt={i => step.s[i]} active={-1} roleAt={i => (step.s.slice(i, i + 2) === '01' ? 'swap' : '')} />
    <output aria-label="Current string">{`Current: ${step.s} (started as ${run.input.s})`}</output>
  </>} renderReasoning={() => <>
    <p>Every 01 pair swaps at once. Two such pairs never share a character, so the swaps do not interfere.</p>
    <p>A 0 moves left one place per second while it has a 1 in front of it. The slowest zero to clear sets the total, which is what the running pass computes.</p>
  </>} />
}
