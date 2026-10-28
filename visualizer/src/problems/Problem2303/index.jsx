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
    { label: 'Example 1', input: '{"brackets":[[3,50],[7,10],[12,25]],"income":10}' },
    { label: 'Example 2', input: '{"brackets":[[1,0],[4,25],[5,50]],"income":2}' },
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
