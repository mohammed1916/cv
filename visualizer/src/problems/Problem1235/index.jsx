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
    { label: 'Example 1', input: '{"startTime":[1,2,3,3],"endTime":[3,4,5,6],"profit":[50,10,40,70]}' },
    { label: 'Chain', input: '{"startTime":[1,1,1],"endTime":[2,3,4],"profit":[5,6,4]}' },
  ],
}

export default function JobScheduling() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Jobs sorted by end time">
      <thead><tr><th>Job</th><th>Start</th><th>End</th><th>Profit</th><th>best[k]</th></tr></thead>
      <tbody>{run.jobs.map((job, i) => <tr key={i} data-role={step.k === i + 1 ? 'active' : undefined}>
        <td>{i + 1}</td><td>{job.start}</td><td>{job.end}</td><td>{job.profit}</td><td>{step.best[i + 1] ?? '-'}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Best profit">{`best so far: ${step.best[step.best.length - 1]}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once jobs are sorted by end time, the jobs compatible with job k are exactly a prefix, so one lookup gives the best profit that can precede it.</p>
  </>} />
}
