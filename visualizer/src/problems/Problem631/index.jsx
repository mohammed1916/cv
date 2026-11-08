import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Blank sheet', description: 'Every cell starts at 0.' },
    { id: 'set', label: 'Set value', description: 'Store a number and drop any formula in that cell.' },
    { id: 'sum', label: 'Sum formula', description: 'Link the cell to the referenced cells; its value is their current sum.' },
    { id: 'get', label: 'Read cell', description: 'Evaluate the cell by following its formula links.' },
    { id: 'done', label: 'Complete', description: 'Report every result in operation order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sheet and operations (JSON)',
  url: 'https://leetcode.com/problems/design-excel-sum-formula/',
  complexity: 'Reading a cell costs time proportional to the cells its formula expands to. The visualization caps the sheet at 10 rows and 10 columns and 30 operations.',
  examples: [
    { label: 'Example 1', input: '{"h":3,"w":"C","ops":[["set",1,"A",2],["sum",3,"C",["A1","A1:B2"]],["set",2,"B",2],["get",3,"C"]]}' },
    { label: 'Chained sums', input: '{"h":3,"w":"B","ops":[["set",1,"A",4],["sum",2,"A",["A1"]],["sum",3,"B",["A2","A1"]],["set",1,"A",1],["get",3,"B"]]}' },
    { label: 'Single cell', input: '{"h":1,"w":"A","ops":[["set",1,"A",7],["get",1,"A"]]}' },
    { label: 'Equal values feed one sum', input: '{"h":2,"w":"B","ops":[["set",1,"A",3],["set",1,"B",3],["sum",2,"B",["A1","B1"]],["get",2,"B"]]}' },
    { label: 'Last row and column at the limits', input: '{"h":10,"w":"J","ops":[["set",10,"J",-5],["sum",9,"J",["J10"]],["get",9,"J"]]}' },
    { label: 'Long run: 30 operations on a 6 by 5 sheet', input: '{"h":6,"w":"E","ops":[["set",1,"A",-15],["set",3,"D",2],["get",3,"D"],["set",4,"D",-12],["set",3,"C",8],["get",6,"B"],["set",1,"B",-9],["set",3,"B",14],["get",3,"E"],["set",4,"E",-6],["set",3,"A",20],["get",6,"C"],["set",1,"C",-3],["set",3,"E",26],["get",3,"A"],["set",4,"A",0],["set",3,"D",32],["get",6,"D"],["set",1,"D",3],["set",3,"C",38],["get",3,"B"],["set",4,"B",6],["set",3,"B",44],["get",6,"E"],["set",1,"E",9],["set",3,"A",50],["get",3,"C"],["set",4,"C",12],["set",3,"E",56],["get",6,"A"]]}' },
  ],
}

export default function DesignExcelSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Sheet values" values={step.grid} activeCell={step.cell} relatedCells={step.refs} rowLabels={run.rowLabels} columnLabels={run.columnLabels} />
    <output aria-label="Value">{step.value === null ? 'No value returned by this operation' : `Value: ${step.value}`}</output>
  </>} renderReasoning={() => <>
    <p>A sum does not copy numbers. It records which cells it reads, so reading it later evaluates those links again and any change made in between is included.</p>
    <p>Setting a cell removes its formula, which is why a later set can break the link that an earlier sum created.</p>
  </>} />
}
