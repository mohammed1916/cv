import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the table of reachable XOR values.' },
    { id: 'cell', label: 'Cell', description: 'Combine the values from the cell above and the cell to the left.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest XOR at the bottom-right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with grid)',
  url: 'https://leetcode.com/problems/minimum-xor-path-in-a-grid/',
  complexity: 'O(m * n * V) time where V is the number of distinct XOR values. The visualization caps the grid at 30 cells.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2],[3,4]]}' },
    { label: 'Example 2', input: '{"grid":[[6,7],[5,8]]}' },
    { label: 'One row', input: '{"grid":[[2,7,5]]}' },
    { label: 'Single cell zero', input: '{"grid":[[0]]}' },
    { label: 'Equal values in a square', input: '{"grid":[[7,7],[7,7]]}' },
    { label: 'Extreme values in 5 by 6', input: '{"grid":[[1023,0,1023,0,1023],[0,1023,0,1023,0],[1023,0,1023,0,1023],[0,1023,0,1023,0],[1023,0,1023,0,1023],[0,1023,0,1023,0]]}' },
    { label: 'Long run: 6 by 5 grid', input: '{"grid":[[118,606,154,775,311],[926,25,931,250,284],[537,437,482,488,947],[320,773,330,377,926],[489,863,331,300,261],[92,515,522,222,483]]}' },
  ],
}

export default function MinimumXorPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = run.input.grid
    const flat = grid.flat()
    const width = grid[0].length
    return <>
      <IndexedSequence label="Grid cells (row by row)" length={flat.length} valueAt={i => flat[i]}
        active={step.cell ? step.cell[0] * width + step.cell[1] : -1} />
      <output aria-label="Reachable XOR values">{`Cell ${step.cell ? `(${step.cell[0]}, ${step.cell[1]})` : '-'}: {${step.values.join(', ')}}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>XOR does not preserve order, so the table keeps every value that can reach a cell rather than only the smallest.</p>
  </>} />
}
