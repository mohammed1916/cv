import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1444',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Pizza rows and piece count (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-of-cutting-a-pizza/',
  complexity: 'O(k * rows * cols * (rows + cols)) time with O(rows * cols) table space per layer, using prefix sums for apple counts.',
  examples: [
    { label: 'Two pieces', input: '{"pizza":["..A","A..",".A."],"k":2}' },
    { label: 'Three pieces', input: '{"pizza":["..A","A..",".A."],"k":3}' },
    { label: 'Corners', input: '{"pizza":["A.A","...","A.A"],"k":2}' },
  ],
}

const cell = (highlight, apple) => ({
  width: 34, height: 30, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
  border: `${highlight ? 2 : 1}px solid ${highlight ? 'var(--text)' : 'var(--border)'}`,
  background: apple ? 'var(--surface2)' : 'transparent',
})

export default function NumberOfWaysOfCuttingAPizza() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { pizza, table, r, c, value, pieces } = step.snapshot
    return <>
      <p>Pizza (A marks an apple)</p>
      <div role="table" aria-label="Pizza grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${pizza[0].length}, 34px)`, gap: 3, width: 'max-content' }}>
        {pizza.flatMap((row, i) => row.split('').map((ch, j) => <div key={`${i}-${j}`} style={cell(i === r && j === c, ch === 'A')}>{ch}</div>))}
      </div>
      {table && <>
        <p>Ways with {pieces - 1} pieces from each corner (previous layer)</p>
        <div role="table" aria-label="Ways table" style={{ display: 'grid', gridTemplateColumns: `repeat(${table[0].length}, 44px)`, gap: 3, width: 'max-content' }}>
          {table.flatMap((row, i) => row.map((v, j) => <div key={`${i}-${j}`} style={{ ...cell(i === r && j === c, false), width: 44, fontSize: '.8rem' }}>{v}</div>))}
        </div>
      </>}
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Idea:</strong> a region from a corner can be cut once from the top or once from the left. Each cut must leave an apple on the removed side.</p>
    <p><strong>Table:</strong> the value at a cell counts the ways to cut the region from that corner into the chosen number of pieces.</p>
    <p>{step.snapshot.value === null ? 'Waiting for the next cell.' : `This cell now holds ${step.snapshot.value}.`}</p>
  </>} />
}
