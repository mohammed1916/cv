import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'Begin with the value 1.' },
    { id: 'element', label: 'Element', description: 'Skip, multiply or divide by each number.' },
    { id: 'done', label: 'Result', description: 'Read the count for k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/count-sequences-to-k/',
  complexity: 'The table can grow with every element. The visual caps the list at 8 numbers from 1 to 6.',
  examples: [
    { label: 'Example', input: '{"nums":[2,5,2],"k":5}' },
    { label: 'Ones', input: '{"nums":[1,1,2],"k":1}' },
  ],
}

export default function CountSequencesToK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Reachable values">
      <thead><tr><th scope="col">Value</th><th scope="col">Ways</th></tr></thead>
      <tbody>{step.table.map(row => <tr key={row.value} data-role={row.value === String(run.input.k) ? 'target' : ''}>
        <th scope="row">{row.value}</th><td>{row.count}</td></tr>)}</tbody>
    </table>
    <output aria-label="Table status">{step.x === null ? 'Table of reachable values' : `Multiplying or dividing by ${step.x} gives ${step.table.length} values`}</output>
  </>} renderReasoning={() => <>
    <p>Each element can be skipped, multiplied in or divided out. Instead of listing every sequence, the table keeps one row per exact value and how many sequences reach it.</p>
    <p>Fractions are reduced so that equal values, such as 2/4 and 1/2, land in the same row.</p>
  </>} />
}
