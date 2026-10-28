import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at position 0 with no backward jump yet.' },
    { id: 'pop', label: 'Expand', description: 'Take a (position, last jump backward?) state and try its jumps.' },
    { id: 'found', label: 'Reached', description: 'The target position is at the front of the search.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of jumps, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with forbidden, a, b and x',
  url: 'https://leetcode.com/problems/minimum-jumps-to-reach-home/',
  complexity: 'O(limit) time and space over the position and direction states.',
  examples: [
    { label: 'Example 1', input: '{"forbidden":[14,4,18,1,15],"a":3,"b":15,"x":9}' },
    { label: 'Example 2', input: '{"forbidden":[8,3,16,6,12,20],"a":15,"b":13,"x":11}' },
  ],
}

export default function MinimumJumpsToReachHome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const forbidden = new Set(run.input.forbidden)
    return <>
      <IndexedSequence label="Positions" length={run.limit + 1} valueAt={i => i} active={step.current ?? -1}
        roleAt={i => (forbidden.has(i) ? 'forbidden' : step.frontier.includes(i) ? 'frontier' : step.visited.includes(i) ? 'visited' : '')} />
      <output aria-label="Jumps">{`Jumps so far: ${step.steps ?? 'not yet'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each jump is forward or backward, and the only state that matters beyond position is whether the last jump went backward.</p>
    <p>Breadth-first order finds the fewest jumps, and positions past a bound are never useful.</p>
  </>} />
}
