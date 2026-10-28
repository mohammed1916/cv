import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the students still unassigned.' },
    { id: 'group', label: 'Form group', description: 'Form a group one student larger than the last, while enough students remain.' },
    { id: 'done', label: 'Complete', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grades (1 to 12 positive integers, one per student)',
  url: 'https://leetcode.com/problems/maximum-number-of-groups-entering-a-competition/',
  complexity: 'O(sqrt(n)) time for the group sizes. The visualization caps input at 12 students.',
  examples: [
    { label: 'Example 1', input: '{"grades":[10,6,12]}' },
    { label: 'Example 2', input: '{"grades":[8,8]}' },
  ],
}

export default function MaximumGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Students (grades, not yet placed)" length={run.input.grades.length} valueAt={i => run.input.grades[i]} active={run.input.grades.length - step.left} roleAt={i => (i >= run.input.grades.length - step.left ? '' : 'grouped')} />
    <output aria-label="Groups so far">{`Groups: ${step.groups}. Students left: ${step.left}. Next group needs ${step.size}.`}</output>
  </>} renderReasoning={() => <>
    <p>Each group must have strictly more students than the one before it, so the smallest possible sizes are 1, 2, 3 and so on.</p>
    <p>Using the smallest size that still fits each time leaves the most students for later groups, so the greedy count is the largest possible.</p>
  </>} />
}
