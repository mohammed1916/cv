import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
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
    { label: 'Own case 1', input: '{"n":6,"speed":[8,5,1,3,10,2],"efficiency":[2,7,9,3,4,5],"k":2}' },
    { label: 'Own case 2', input: '{"n":6,"speed":[8,5,1,3,10,2],"efficiency":[2,7,9,3,4,5],"k":3}' },
    { label: "Single engineer", input: "{\"n\":1,\"speed\":[4],\"efficiency\":[9],\"k\":1}" },
    { label: "Equal efficiency ties by speed", input: "{\"n\":3,\"speed\":[2,5,3],\"efficiency\":[4,4,4],\"k\":2}" },
    { label: "Team of all eight", input: "{\"n\":8,\"speed\":[1,2,3,4,5,6,7,8],\"efficiency\":[8,7,6,5,4,3,2,1],\"k\":8}" },
    { label: "Long run: 8 engineers", input: "{\"n\":8,\"speed\":[16,15,16,18,3,15,10,14],\"efficiency\":[2,1,6,17,13,5,16,3],\"k\":3}" },
  ],
}

export default function MaximumPerformance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Speeds (team members marked)" length={run.input.speed.length} valueAt={i => run.input.speed[i]}
      active={step.current} roleAt={i => (step.team.includes(i) ? 'in team' : i === step.removed ? 'removed' : '')} />
    <RecordStateTable label="Engineers visited from highest efficiency" columns={['engineer', 'speed', 'efficiency', 'in team']}
      activeRow={run.order.indexOf(step.current)}
      rows={run.order.map(i => ({
        engineer: i, speed: run.input.speed[i], efficiency: run.input.efficiency[i], 'in team': step.team.includes(i) ? 'yes' : 'no',
      }))} />
    <output aria-label="Best performance">{`Best so far: ${step.best}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A team's efficiency is set by its least efficient member, so the engineers are visited from most to least efficient.</p>
    <p>At each engineer, the k fastest so far form the best team that includes that engineer's efficiency, so a min heap drops the slowest when the team grows past k.</p>
  </>} />
}
