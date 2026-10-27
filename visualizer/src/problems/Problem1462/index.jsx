import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Direct prerequisites', description: 'Mark each prerequisite pair as reachable.' },
    { id: 'pivot', label: 'Pivot course k', description: 'Let course k join pairs that both reach it and are reached from it.' },
    { id: 'relax', label: 'New reachability', description: 'Mark a pair reachable through course k.' },
    { id: 'done', label: 'Answer queries', description: 'Read each query from the closed matrix.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Courses (JSON with n, prerequisites, queries)',
  url: 'https://leetcode.com/problems/course-schedule-iv/',
  complexity: 'O(n^3 + q) time and O(n^2) space for the transitive closure. Visualization limited to 8 courses and 12 prerequisites.',
  examples: [
    { label: 'false, true', input: '{"n":2,"prerequisites":[[1,0]],"queries":[[0,1],[1,0]]}' },
    { label: 'true, true', input: '{"n":3,"prerequisites":[[1,2],[1,0],[2,0]],"queries":[[1,0],[1,2]]}' },
    { label: 'true, false, true', input: '{"n":5,"prerequisites":[[0,1],[1,2],[2,3],[3,4]],"queries":[[0,4],[4,0],[1,3]]}' },
  ],
}

export default function CourseReachability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DistanceMatrixView label="Reachability: row course must come before column course (1 yes, 0 no)" matrix={step.matrix} activeCell={step.target ? { row: step.target[0], col: step.target[1] } : null} highlightedCells={step.highlighted} queueLabel="Queries" queue={step.queue} />
    <output aria-label="Answer">{step.phase === 'done' ? `Answers: ${run.result.map(String).join(', ')}` : 'Working...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A prerequisite chain can be long, so the check is transitive. Floyd-Warshall closes the relation: after pivot k, any pair linked through k is marked, and each query is a single lookup.</p>
  </>} />
}
