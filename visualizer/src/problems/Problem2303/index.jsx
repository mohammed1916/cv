import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no tax and no bracket processed.' },
    { id: 'bracket', label: 'Bracket', description: 'Tax the slice of income that falls inside this bracket.' },
    { id: 'done', label: 'Complete', description: 'Report the total tax.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with brackets [[upper, percent]] and income (JSON)',
  url: 'https://leetcode.com/problems/calculate-amount-paid-in-taxes/',
  complexity: 'O(b) time and O(1) extra space for b brackets.',
  examples: [
    { label: 'Own case 1', input: '{"brackets":[[4,51],[8,11],[13,26]],"income":11}' },
    { label: 'Own case 2', input: '{"brackets":[[2,1],[5,26],[6,51]],"income":3}' },
    { label: 'Single bracket, full income', input: '{"brackets":[[10,20]],"income":10}' },
    { label: 'Zero income', input: '{"brackets":[[5,10],[9,20]],"income":0}' },
    { label: 'Ten brackets up to 100', input: '{"brackets":[[10,0],[20,10],[30,20],[40,30],[50,40],[60,50],[70,60],[80,70],[90,80],[100,90]],"income":100}' },
    { label: 'Long run: ten brackets', input: '{"brackets":[[14,43],[20,42],[42,55],[52,73],[58,11],[68,21],[72,46],[79,50],[81,56],[93,18]],"income":92}' },
  ],
}

export default function CalculateTaxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Brackets (percent)" length={run.input.brackets.length} active={step.index}
      valueAt={index => `${run.input.brackets[index][1]}%`}
      roleAt={index => (step.phase === 'done' || index < step.index ? 'taxed' : '')} />
    <output aria-label="Tax so far">{`Tax so far: ${step.tax}`}</output>
  </>} renderReasoning={() => <>
    <p>Each bracket is charged only on the income between the previous upper bound and its own upper bound.</p>
    <p>The brackets are applied in order, so the tax is a sum of independent slices.</p>
  </>} />
}
