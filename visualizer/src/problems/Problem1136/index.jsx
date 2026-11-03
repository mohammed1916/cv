import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with courses and relations [before, after] (JSON)',
  url: 'https://leetcode.com/problems/parallel-courses/',
  complexity: 'O(n + r) time and space for n courses and r relations. The visualization caps the input at 10 courses and 15 relations.',
  examples: [
    { label: 'Chain of three', input: '{"courses":3,"relations":[[1,2],[2,3]]}' },
    { label: 'Diamond', input: '{"courses":4,"relations":[[1,2],[1,3],[2,4],[3,4]]}' },
    { label: 'Cycle', input: '{"courses":2,"relations":[[1,2],[2,1]]}' },
  ],
}

export default function ParallelCourses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { unmet, available, semester, finished, current } = step.snapshot
    return <>
      <table aria-label="Unmet prerequisites" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{Object.entries(unmet).map(([course, count]) => {
          const now = current?.includes(Number(course))
          return <tr key={course} data-course={course} style={{ background: now ? 'var(--surface2)' : 'transparent' }}>
            <td style={{ padding: '4px 10px' }}>Course {course}</td>
            <td style={{ padding: '4px 10px' }}>{finished.includes(Number(course)) ? 'done' : `${count} unmet`}</td>
          </tr>
        })}</tbody>
      </table>
      <p>{semester ? `Semester ${semester}` : 'No semester yet'} · unlocked next: {available.length ? available.join(', ') : 'none'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Semesters are layers:</strong> every course whose prerequisites are all finished joins the current semester.</p>
    <p><strong>Release dependants:</strong> finishing a course lowers the unmet count of each course that needs it. Counts that reach zero form the next layer.</p>
  </>} />
}
