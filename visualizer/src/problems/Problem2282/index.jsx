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
