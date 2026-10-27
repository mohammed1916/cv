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
