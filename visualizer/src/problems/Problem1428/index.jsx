import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LeftmostOneView from './LeftmostOneView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Dimensions', description: 'Read the grid size.' },
    { id: 'init', label: 'Corner', description: 'Begin at the top-right corner.' },
    { id: 'check', label: 'Bounds', description: 'Test whether the cursor is still on the grid.' },
    { id: 'probe', label: 'Probe', description: 'Read one cell with get.' },
    { id: 'hit', label: 'Record', description: 'A one moves the best column left.' },
    { id: 'left', label: 'Left', description: 'Look one column further left.' },
    { id: 'down', label: 'Down', description: 'A zero rules out this row.' },
    { id: 'done', label: 'Result', description: 'Report the leftmost column with a one.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary matrix as rows of 0 and 1, each row sorted (e.g. [[0,0,1],[0,1,1]])',
  url: 'https://leetcode.com/problems/leftmost-column-with-at-least-a-one/',
  complexity: 'O(rows + cols) get calls: the cursor starts at the top-right corner and only moves left or down, so no cell is read twice. The visualization caps the matrix at 8 x 8; the official query budget is not checked here.',
  examples: [
    { label: 'Staircase', input: '[[0,0,0,0,1],[0,0,1,1,1],[0,0,0,1,1]]' },
    { label: 'Narrow band', input: '[[0,0,0,0,0,0],[0,0,0,0,1,1],[0,0,0,1,1,1],[0,1,1,1,1,1]]' },
    { label: 'No ones', input: '[[0,0,0],[0,0,0]]' },
  ],
}

export default function LeftmostColumnWithOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LeftmostOneView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step?.message}</p>
    <p>Each row is sorted, so a zero at the cursor rules out the whole row from that column leftward. A one only pulls the cursor further left.</p>
  </>} />
}
