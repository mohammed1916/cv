import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { Vars } from './SeqKit'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Dice, faces and target as JSON: [dice, faces, target]',
  complexity: 'O(dice × target × faces) time with O(target) memory. The trace accepts dice up to 8, faces up to 8, and target up to 40.',
  examples: [
    { label: 'Three two-faced dice', input: '[3,2,4]' },
    { label: 'Single die', input: '[1,6,4]' },
    { label: 'Two three-faced dice', input: '[2,3,6]' },
    { label: 'Single die with one face', input: '[1,1,1]' },
    { label: 'Target above the maximum sum', input: '[2,3,7]' },
    { label: 'Largest dice and faces', input: '[8,8,40]' },
    { label: 'Long run: 8 dice of 6 faces', input: '[8,6,24]' },
  ],
}

export default function DiceRollsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const done = step.phase === 'done'
    const values = done ? [s.prev] : [s.prev, s.cur ?? s.prev.map(() => null)]
    const target = done ? [0, s.target] : [s.cur ? 1 : 0, s.sum ?? 0]
    const sources = s.reads && s.sum !== null && !done ? s.reads.map(r => ({ cell: [0, r], note: `face ${s.sum - r}`, chosen: false })) : []
    return <>
      <DPDependencyView title={`Ways to reach each sum with ${s.row} dice`} shape="grid" values={values} target={target} sources={sources}
        labels={{ rows: done ? [`${s.row} dice`] : [`${Math.max(0, s.row - 1)} dice`, `${s.row} dice`] }}
        recurrence="ways[d][s] = sum over faces f of ways[d-1][s-f]"
        why="The last die shows one face, so every way to reach s - f with one fewer die extends to s." />
      <Vars vars={{ dice: s.dice, faces: s.faces, target: s.target, 'sum being filled': s.sum ?? null }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <p>Each row is built from the row before it: the last die adds one face to every way of reaching the earlier sums.</p>} />
}
