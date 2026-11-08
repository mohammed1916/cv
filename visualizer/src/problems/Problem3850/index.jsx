import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Single element', input: '{"nums":[1],"k":1}' },
    { label: 'Equal values, repeated count', input: '{"nums":[2,2,2],"k":2}' },
    { label: 'Upper input bound', input: '{"nums":[6,6,6,6,6,6,6,6],"k":100000}' },
    { label: 'No reachable target', input: '{"nums":[2,2],"k":3}' },
    { label: 'Long run: 8 items', input: '{"nums":[5,4,2,5,5,5,1,1],"k":36}' },
  ],
}

export default function CountSequencesToK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums in order (the element being applied is marked)" length={run.input.nums.length}
      active={step.index ?? -1} valueAt={index => run.input.nums[index]}
      roleAt={index => step.index !== undefined && index < step.index ? 'applied' : ''} />
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
