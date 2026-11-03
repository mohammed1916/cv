import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

function SumRows({ snapshot }) {
  const cells = (values, highlight) => <div style={{ display: 'grid', gridTemplateColumns: `repeat(${values.length}, minmax(28px, 1fr))`, gap: 4 }}>
    {values.map((value, sum) => <div key={sum} style={{
      border: '1px solid currentColor', borderRadius: 4, padding: 4, textAlign: 'center',
      fontWeight: highlight?.includes(sum) ? 700 : 400, opacity: highlight && !highlight.includes(sum) ? 0.55 : 1,
    }}><small>{sum}</small><br />{value}</div>)}
  </div>
  return <div>
    <p>Previous row (dice − 1), reads shown in bold</p>
    {cells(snapshot.prev, snapshot.reads)}
    <p>New row (dice {snapshot.row}){snapshot.sum !== null ? `, writing sum ${snapshot.sum}` : ''}</p>
    {snapshot.cur ? cells(snapshot.cur, snapshot.sum !== null ? [snapshot.sum] : null) : <p>Answer read from the final row.</p>}
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Dice, faces and target as JSON: [dice, faces, target]',
  complexity: 'O(dice × target × faces) time with O(target) memory. The trace accepts dice up to 8, faces up to 8, and target up to 40.',
  examples: [
    { label: 'Three two-faced dice', input: '[3,2,4]' },
    { label: 'Single die', input: '[1,6,3]' },
    { label: 'Two three-faced dice', input: '[2,3,6]' },
  ],
}

export default function DiceRollWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <SumRows snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
