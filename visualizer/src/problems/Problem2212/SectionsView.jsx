import RecordStateTable from '../../components/shared/RecordStateTable'

// One row per section: Alice's arrows, the cost for Bob to win it, and Bob's arrows once they are decided.
export default function SectionsView({ run, step }) {
  const { aliceArrows, numArrows } = run.input
  const rows = aliceArrows.map((a, k) => ({
    section: k,
    alice: a,
    'bob needs': k === 0 ? 'any' : a + 1,
    bob: step.bob ? step.bob[k] : '-',
  }))
  return (
    <div className="sections-view">
      <p>Bob has {numArrows} arrows. A section is worth its number in points when Bob has more arrows there than Alice.</p>
      <RecordStateTable label="Sections 0 to 11" columns={['section', 'alice', 'bob needs', 'bob']} rows={rows} activeRow={step.k ?? -1} />
      <p>Best points with each arrow budget so far: {step.best ? step.best.join(', ') : '-'}</p>
    </div>
  )
}
