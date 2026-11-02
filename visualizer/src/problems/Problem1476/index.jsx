import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base', description: 'Keep the original rectangle.' },
    { id: 'update', label: 'Update', description: 'Log a rectangle assignment without touching cells.' },
    { id: 'scan', label: 'Scan log', description: 'Check the newest update first.' },
    { id: 'answer', label: 'Answer', description: 'Return the newest covering value or the base value.' },
    { id: 'done', label: 'Done', description: 'All operations processed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rectangle and ops (updateSubrectangle / getValue arrays)',
  url: 'https://leetcode.com/problems/subrectangle-queries/',
  complexity: 'Update is O(1) and getValue is O(u) for u logged updates. The visualization caps the grid at 6 by 6 and ops at 20.',
  examples: [
    { label: 'Example', input: '{"rectangle":[[1,2,1],[4,3,4],[3,2,1],[1,1,1]],"ops":[["getValue",0,2],["updateSubrectangle",0,0,3,2,5],["getValue",0,2],["getValue",3,1],["updateSubrectangle",3,0,3,2,10],["getValue",3,1],["getValue",0,2]]}' },
    { label: 'Base only', input: '{"rectangle":[[7,8],[9,10]],"ops":[["getValue",1,0],["getValue",0,1]]}' },
  ],
}

const sameCell = (step, r, c) => !!step.query && step.query[0] === r && step.query[1] === c

export default function SubrectangleQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecurrenceGrid label="Rectangle with logged updates" rowLabels={run.input.rectangle.map((_, r) => `row ${r}`)}
      columnLabels={run.input.rectangle[0].map((_, c) => `col ${c}`)} row={step.row} column={step.column}
      valueAt={(r, c) => step.grid[r][c]}
      roleAt={(r, c) => sameCell(step, r, c) ? 'query' : step.region && r >= step.region[0] && r <= step.region[2] && c >= step.region[1] && c <= step.region[3] ? 'updated' : ''} />
    <output aria-label="Query answer">{step.answer === null ? 'No answer yet' : `Answer ${step.answer}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>An update only appends its rectangle to a log. Each getValue walks the log from newest to oldest and stops at the first rectangle that covers the cell.</p>
    <p>When no update covers the cell, the answer is the value from the original rectangle.</p>
  </>} />
}
