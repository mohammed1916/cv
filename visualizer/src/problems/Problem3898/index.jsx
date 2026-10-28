import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Create one zero per vertex.' },
    { id: 'row', label: 'Row sum', description: 'Count the ones in this row; that count is the vertex degree.' },
    { id: 'done', label: 'Return', description: 'Every row has been counted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Adjacency matrix (JSON): {"matrix": [[...]]}',
  url: 'https://leetcode.com/problems/find-the-degree-of-each-vertex/',
  complexity: 'O(n^2) time and O(n) extra space for the answer. The visualization caps the matrix at 8 rows.',
  examples: [
    { label: 'Triangle', input: '{"matrix":[[0,1,1],[1,0,1],[1,1,0]]}' },
    { label: 'Linked pair', input: '{"matrix":[[0,1,0],[1,0,0],[0,0,0]]}' },
  ],
}

export default function FindDegreeOfEachVertex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Degree of each vertex" length={run.input.matrix.length} valueAt={j => step.ans[j]} active={step.row} />
    <output aria-label="Current row">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each edge touches exactly two rows, and a row's ones are exactly the edges at that vertex, so the degree is the row sum.</p>
    <p>Because the matrix is symmetric, reading one triangle would count each edge once, but a row sum already counts it for both endpoints.</p>
  </>} />
}
