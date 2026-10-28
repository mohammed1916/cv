import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Check each coupon against the rules.' },
    { id: 'keep', label: 'Keep', description: 'The code, business line and active flag all pass.' },
    { id: 'drop', label: 'Drop', description: 'A rule fails, so the coupon is not kept.' },
    { id: 'done', label: 'Complete', description: 'Report the kept codes in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with code, business_line and is_active arrays of equal length (1 to 8 coupons)',
  url: 'https://leetcode.com/problems/coupon-code-validator/',
  complexity: 'O(n log n) time for n coupons. The visualization caps coupons at 8.',
  examples: [
    { label: 'Example 1', input: '{"code":["SAVE20","","PHARMA5","SAVE@20"],"business_line":["restaurant","grocery","pharmacy","restaurant"],"is_active":[true,true,true,true]}' },
    { label: 'Example 2', input: '{"code":["GROCERY15","ELECTRONICS_50","DISCOUNT10"],"business_line":["grocery","electronics","invalid"],"is_active":[false,true,true]}' },
  ],
}

export default function CouponValidator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Coupons" length={run.input.code.length} valueAt={index => `${run.input.code[index] || '(empty)'} · ${run.input.business_line[index]}`} active={step.index} roleAt={index => (index === step.index ? (step.phase === 'keep' ? 'kept' : step.phase === 'drop' ? 'rejected' : '') : '')} />
    <output aria-label="Kept">{`Kept so far: ${step.kept}`}</output>
  </>} renderReasoning={() => <>
    <p>Each coupon is judged on three independent rules: a non-empty code of letters, digits and underscores; a known business line; and an active flag.</p>
    <p>The kept coupons are then sorted by the fixed business order, and by code inside each group.</p>
  </>} />
}
