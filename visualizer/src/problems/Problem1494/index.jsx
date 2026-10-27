import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Nothing taken', description: 'No course is finished; only courses without prerequisites are ready.' },
    { id: 'semester', label: 'Next semester', description: 'Extend every set of finished courses by one semester.' },
    { id: 'expand', label: 'Expand set', description: 'Take the allowed number of ready courses from this finished set.' },
    { id: 'done', label: 'Complete', description: 'Report the number of semesters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Courses (JSON object with n, relations as [before, after] pairs, and k)',
  url: 'https://leetcode.com/problems/parallel-courses-ii/',
  complexity: 'O(2^n * n) states with subset enumeration per state. The visualization caps input at 8 courses.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"relations":[[2,1],[3,1],[1,4]],"k":2}' },
    { label: 'Example 2', input: '{"n":5,"relations":[[2,1],[3,1],[4,1],[1,5]],"k":2}' },
  ],
}

const ROLE_TEXT = { taken: 'finished', ready: 'ready', waiting: 'waiting' }

export default function ParallelCourses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Courses" length={run.n} valueAt={i => `Course ${i + 1}`}
      roleAt={i => (step.roles ? ROLE_TEXT[step.roles[i]] : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A set of finished courses is a bitmask. A course is ready when all its prerequisites are inside the mask.</p>
    <p>Finishing more courses never delays the rest, so each semester takes the largest allowed number of ready courses.</p>
  </>} />
}
