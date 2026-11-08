import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the jobs by end time.' },
    { id: 'job', label: 'Job', description: 'Decide whether this job should be taken or skipped.' },
    { id: 'done', label: 'Complete', description: 'Report the best total profit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: startTime, endTime and profit arrays of equal length',
  url: 'https://leetcode.com/problems/maximum-profit-in-job-scheduling/',
  complexity: 'O(n^2) time for this visualization, which counts compatible jobs by scanning. The standard solution is O(n log n). The visualization caps input at 10 jobs.',
  examples: [
    { label: 'Four jobs, one long', input: '{"startTime":[1,2,6,8],"endTime":[3,7,10,12],"profit":[20,40,15,60]}' },
    { label: 'Chain', input: '{"startTime":[1,1,1],"endTime":[2,3,4],"profit":[5,6,4]}' },
    { label: 'Single job', input: '{\"startTime\":[0],\"endTime\":[5],\"profit\":[10]}' },
    { label: 'Identical jobs with equal profit', input: '{\"startTime\":[1,1],\"endTime\":[4,4],\"profit\":[5,5]}' },
    { label: 'Back-to-back jobs both fit', input: '{\"startTime\":[0,3],\"endTime\":[3,6],\"profit\":[4,4]}' },
    { label: 'Long run: ten jobs', input: '{\"startTime\":[12,6,11,9,0,2,2,10,16,16],\"endTime\":[15,13,12,11,8,18,17,12,20,19],\"profit\":[44,5,78,49,100,9,2,81,16,52]}' },
  ],
}

export default function JobScheduling() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Jobs sorted by end time">
      <thead><tr><th>Job</th><th>Start</th><th>End</th><th>Profit</th><th>best[k]</th><th>role</th></tr></thead>
      <tbody>{run.jobs.map((job, i) => {
        const k = i + 1
        const role = step.k === k ? 'current job k' : step.p !== null && step.p === k ? 'p' : ''
        return <tr key={i} data-role={step.k === k ? 'active' : undefined} style={{ background: step.k === k ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'transparent' }}>
          <td>{k}</td><td>{job.start}</td><td>{job.end}</td><td>{job.profit}</td><td>{step.best[k] ?? '-'}</td><td>{role}</td>
        </tr>
      })}</tbody>
    </table>
    {step.k > 0 && step.p !== null && <p>p = {step.p}: jobs 1 to {step.p} end by the start of job {step.k}, so they can come before it.</p>}
    <output aria-label="Best profit">{`best so far: ${step.best[step.best.length - 1]}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once jobs are sorted by end time, the jobs compatible with job k are exactly a prefix, so one lookup gives the best profit that can precede it.</p>
  </>} />
}
