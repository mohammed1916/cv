import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No prime found yet.' },
    { id: 'row', label: 'Row', description: 'Move to the next row and look at its diagonal cells.' },
    { id: 'record', label: 'Record', description: 'A diagonal cell is a new largest prime.' },
    { id: 'skip', label: 'Skip', description: 'The cell is not prime or not larger than the best.' },
    { id: 'done', label: 'Result', description: 'Report the largest prime.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: a square matrix of integers 1 to 50 (JSON)',
  url: 'https://leetcode.com/problems/prime-in-diagonal/',
  complexity: 'O(n * sqrt(V)) time, O(1) extra space. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example', input: '{"nums":[[1,2],[3,4]]}' },
    { label: 'No prime', input: '{"nums":[[4,6],[8,9]]}' },
    { label: 'Single cell', input: '{"nums":[[7]]}' },
    { label: 'Equal values', input: '{"nums":[[5,5],[5,5]]}' },
    { label: 'Six by six limit values', input: '{"nums":[[50,1,50,1,50,1],[1,50,1,50,1,50],[50,1,50,1,50,1],[1,50,1,50,1,50],[50,1,50,1,50,1],[1,50,1,50,1,50]]}' },
    { label: 'Long run: six by six', input: '{"nums":[[28,31,26,7,50,37],[36,15,18,49,26,7],[40,37,44,37,50,39],[14,3,42,5,12,31],[12,11,14,23,18,23],[26,31,8,11,6,5]]}' },
  ],
}

export default function PrimeInDiagonal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const size = run.input.nums.length
    const flat = run.input.nums.flat()
    const diagonal = i => { const r = Math.floor(i / size), c = i % size; return r === c || r + c === size - 1 }
    const active = step.row >= 0 ? step.row * size + step.col : -1
    return <>
      <IndexedSequence label="Matrix (row-major)" length={flat.length} valueAt={i => flat[i]} active={active}
        roleAt={i => (diagonal(i) ? 'diagonal' : '')} />
      <output aria-label="Best prime">{`Best prime so far: ${step.best || 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only cells on the main diagonal (row equals column) and the anti-diagonal (row plus column equals n minus 1) can count.</p>
    <p>A centre cell in an odd matrix lies on both diagonals, so it is checked once per row and need not be counted twice.</p>
  </>} />
}
