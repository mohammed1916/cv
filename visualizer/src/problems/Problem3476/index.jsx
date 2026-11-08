import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SkillLadderView from './SkillLadderView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3476',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with workers (skill numbers) and tasks ([skill, profit] pairs)',
  url: 'https://leetcode.com/problems/maximize-profit-from-task-assignment/',
  complexity: 'O(t^2 * s log t) time for t tasks and s distinct skills, using a full greedy re-match for each task given to the extra worker. Space is O(t). The visualization caps the input at 6 workers and 6 tasks.',
  examples: [
    { label: 'Extra worker helps', input: '{"workers":[1,2],"tasks":[[1,4],[2,3],[3,9]]}' },
    { label: 'Skill matching is enough', input: '{"workers":[1,1,2],"tasks":[[1,5],[1,2],[2,6]]}' },
    { label: 'Tight skills', input: '{"workers":[3,3],"tasks":[[1,8],[3,7],[3,2]]}' },
    { label: 'Single worker and task', input: '{"workers":[3],"tasks":[[3,9]]}' },
    { label: 'Equal skills tie', input: '{"workers":[2,2],"tasks":[[2,4],[2,4]]}' },
    { label: 'Largest skills and profits', input: '{"workers":[1,5,5,1,3,2],"tasks":[[5,9],[1,9],[3,9],[2,9],[4,1],[1,1]]}' },
    { label: 'No worker meets the task skill', input: '{"workers":[5],"tasks":[[1,9]]}' },
    { label: 'Long run: 6 workers and 6 tasks', input: '{"workers":[1,3,2,5,2,4],"tasks":[[1,5],[1,3],[4,8],[5,6],[4,8],[5,3]]}' },
  ],
}

export default function MaximizeProfitFromTaskAssignmentVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SkillLadderView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
