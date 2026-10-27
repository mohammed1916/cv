import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Engineers are visited from the highest efficiency down.' },
    { id: 'consider', label: 'Consider', description: 'Add the engineer to the team; if the team is too big, drop the slowest member.' },
    { id: 'done', label: 'Complete', description: 'Report the best performance modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": engineers, "speed": [...], "efficiency": [...], "k": team size}',
  url: 'https://leetcode.com/problems/maximum-performance-of-a-team/',
  complexity: 'O(n log n + n log k) time with a min heap of team speeds. The visualization caps input at 8 engineers.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"speed":[2,10,3,1,5,8],"efficiency":[5,4,3,9,7,2],"k":2}' },
    { label: 'Example 2', input: '{"n":6,"speed":[2,10,3,1,5,8],"efficiency":[5,4,3,9,7,2],"k":3}' },
  ],
}

export default function MaximumPerformance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Speeds (team members marked)" length={run.input.speed.length} valueAt={i => run.input.speed[i]}
      active={step.current} roleAt={i => (step.team.includes(i) ? 'in team' : i === step.removed ? 'removed' : '')} />
    <output aria-label="Best performance">{`Best so far: ${step.best}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A team's efficiency is set by its least efficient member, so the engineers are visited from most to least efficient.</p>
    <p>At each engineer, the k fastest so far form the best team that includes that engineer's efficiency, so a min heap drops the slowest when the team grows past k.</p>
  </>} />
}
