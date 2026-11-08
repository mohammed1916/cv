import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'One each', description: 'Every child receives one dollar first.' },
    { id: 'eight', label: 'Top up', description: 'Add 7 dollars to a child so that child holds 8.' },
    { id: 'fix', label: 'Repair', description: 'Undo one 8 if the leftover would force a child to 4 or leave 9 or more.' },
    { id: 'done', label: 'Complete', description: 'Report the count of children with exactly 8 dollars.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with integer money and children',
  url: 'https://leetcode.com/problems/distribute-money-to-maximum-children/',
  complexity: 'O(children) time. The visualization caps children at twenty.',
  examples: [
    { label: 'Own case 1', input: '{"money":21,"children":4}' },
    { label: 'Own case 2', input: '{"money":17,"children":3}' },
    { label: 'Zero money for one child', input: '{"money":0,"children":1}' },
    { label: 'Money equals child count', input: '{"money":8,"children":8}' },
    { label: 'Largest money and children', input: '{"money":200,"children":20}' },
    { label: 'Long run: 19 children', input: '{"money":173,"children":19}' },
  ],
}

export default function DistributeMoneyMaximumChildren() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Dollars per child" length={run.input.children} valueAt={index => step.alloc[index]} active={step.index} roleAt={index => (step.alloc[index] === 8 ? 'eight' : '')} />
    <output aria-label="Money left">{`Dollars left to hand out: ${step.left}, children with 8: ${step.eights}`}</output>
  </>} renderReasoning={() => <>
    <p>Each child must get at least one dollar, and nobody may get exactly four. Starting with one dollar each, the rest is handed out in blocks of seven, which turns a child into exactly 8.</p>
    <p>If every child already has 8 and money is left over, or only one child is left and exactly three dollars remain, one 8 has to give way.</p>
  </>} />
}
