import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PeopleSeenView from './PeopleSeenView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Zero every answer cell.' },
    { id: 'line', label: 'Line', description: 'Begin one row or column with an empty stack.' },
    { id: 'scan', label: 'Scan', description: 'Read the height at this position.' },
    { id: 'pop', label: 'Pop', description: 'A shorter person on the stack is visible.' },
    { id: 'count', label: 'Count', description: 'Record the visible total in this direction.' },
    { id: 'push', label: 'Push', description: 'Keep this person for the positions before them.' },
    { id: 'add', label: 'Add', description: 'Fold the pass into the answer grid.' },
    { id: 'done', label: 'Result', description: 'Right plus down counts for every cell.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Heights grid as rows of integers, e.g. [[3,1,4],[1,5,9]]',
  url: 'https://leetcode.com/problems/number-of-people-that-can-be-seen-in-a-grid/',
  complexity: 'O(m * n) time and space for an m by n grid, since each cell is pushed and popped at most once per pass. The visualization caps the grid at 8 by 8 with heights from 1 to 99; this draft does not state official bounds.',
  examples: [
    { label: 'Mixed heights', input: '[[6,2,8,3],[4,9,1,5],[7,3,2,6]]' },
    { label: 'Equal heights', input: '[[4,4,4],[4,1,4]]' },
    { label: 'Single column', input: '[[5],[2],[6],[1]]' },
    { label: 'Single cell', input: '[[5]]' },
    { label: 'Single row of equal heights', input: '[[2,2,2,2]]' },
    { label: 'Largest grid, 8 by 8', input: '[[1,99,1,99,1,99,1,99],[99,1,99,1,99,1,99,1],[1,99,1,99,1,99,1,99],[99,1,99,1,99,1,99,1],[1,99,1,99,1,99,1,99],[99,1,99,1,99,1,99,1],[1,99,1,99,1,99,1,99],[99,1,99,1,99,1,99,1]]' },
    { label: 'Long run: 8 by 8', input: '[[32,81,4,61,47,30,78,74],[11,58,47,1,82,32,16,29],[5,8,32,52,12,74,88,14],[67,78,50,29,46,59,95,6],[71,75,12,30,3,98,69,81],[33,10,75,97,22,19,79,8],[88,5,76,92,42,30,34,50],[9,85,44,80,6,73,66,97]]' },
  ],
}

export default function PeopleSeenInAGrid() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <PeopleSeenView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each row and column is swept once with a stack. Anyone shorter than the current person is visible, and the first person at least as tall is visible too, then blocks everyone further along.</p>
    </>} />
}
