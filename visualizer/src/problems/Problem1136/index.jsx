import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { Vars } from './SeqKit'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with courses and relations [before, after] (JSON)',
  url: 'https://leetcode.com/problems/parallel-courses/',
  complexity: 'O(n + r) time and space for n courses and r relations. The visualization caps the input at 10 courses and 15 relations.',
  examples: [
    { label: 'Chain of three', input: '{"courses":3,"relations":[[1,2],[2,3]]}' },
    { label: 'Diamond', input: '{"courses":4,"relations":[[1,2],[1,3],[2,4],[3,4]]}' },
    { label: 'Cycle', input: '{"courses":2,"relations":[[1,2],[2,1]]}' },
    { label: 'Single course', input: '{"courses":1,"relations":[]}' },
    { label: 'No relations', input: '{"courses":3,"relations":[]}' },
    { label: 'Long run: 10 courses, 15 relations', input: '{"courses":10,"relations":[[1,2],[1,3],[2,4],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[2,7],[3,8],[4,9],[5,10],[1,6]]}' },
  ],
}

export default function ParallelCourses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { unmet, available, semester, finished, current } = step.snapshot
    const { courses, relations } = run.input
    // The dependency map: each course with the prerequisites it waits for.
    const needs = Array.from({ length: courses + 1 }, () => [])
    for (const [before, after] of relations) needs[after].push(before)
    const rows = Array.from({ length: courses }, (_, i) => {
      const course = i + 1
      const status = finished.includes(course) ? 'finished' : current?.includes(course) ? 'running' : available.includes(course) ? 'ready' : 'waiting'
      return { course, needs: needs[course].length ? needs[course].join(', ') : 'none', unmet: unmet[course] ?? 0, status }
    })
    const activeRow = rows.findIndex(row => row.status === 'running' || row.status === 'ready')
    const edges = relations.map(([before, after]) => [before - 1, after - 1])
    return <>
      <GraphTraversalView title="Prerequisite graph" n={courses} edges={edges} directed
        labels={Array.from({ length: courses }, (_, i) => `C${i + 1}`)}
        frontier={available.map(c => c - 1)} done={finished.map(c => c - 1)} />
      <RecordStateTable label="Dependency map: course, prerequisites, unmet count, status" columns={['course', 'needs', 'unmet', 'status']} rows={rows} activeRow={activeRow} />
      <Vars vars={{ semester: semester || null, 'ready now': available.length ? available.join(', ') : 'none', finished: `${finished.length} of ${courses}` }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Dependency map:</strong> each course lists the prerequisites it waits for. A course is ready when none of them are still unfinished.</p>
    <p><strong>Semesters are layers:</strong> finishing a course lowers the unmet count of each course that needs it, and counts that reach zero form the next layer.</p>
    <p>{step.message}</p>
  </>} />
}
