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
    { label: 'Four blocked spots', input: '{"forbidden":[7,12,20,3],"a":5,"b":9,"x":18}' },
    { label: 'Three blocked spots, far target', input: '{"forbidden":[2,6,9],"a":3,"b":8,"x":25}' },
    { label: 'One forbidden position', input: '{"forbidden":[1],"a":1,"b":1,"x":2}' },
    { label: 'Equal jump lengths', input: '{"forbidden":[3,5],"a":4,"b":4,"x":1}' },
    { label: 'Largest limits', input: '{"forbidden":[21,22,23,24,25,26,27,28,29,30],"a":20,"b":20,"x":1}' },
    { label: 'Long run: 10 forbidden positions', input: '{"forbidden":[29,9,26,17,7,3,23,25,1,24],"a":7,"b":11,"x":2}' },
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
