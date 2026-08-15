import './PointerStateBand.css'

const PAIRS = [
  ['low', 'high', 'Search window', '→'],
  ['left', 'right', 'Two pointers', '↔'],
  ['l', 'r', 'Two pointers', '↔'],
  ['start', 'end', 'Active range', '→'],
  ['i', 'j', 'Indices', '↔'],
];

export default function PointerStateBand({ step }) {
  if (!step) return null
  const pair = PAIRS.find(([first, second]) => Number.isFinite(step[first]) && Number.isFinite(step[second]))
  const partitions = Number.isFinite(step.partitionA) || Number.isFinite(step.partitionB)
  if (!pair && !partitions) return null

  const direction = step.phase?.includes('left') ? 'move left' : step.phase?.includes('right') ? 'move right' : null
  return (
    <div className="pointer-state-band" aria-label="Active pointers">
      {pair && <>
        <span className="pointer-state-kind">{pair[2]}</span>
        <span className="pointer-state-value info">{pair[0]} <b>{step[pair[0]]}</b></span>
        <span className="pointer-state-arrow">{pair[3]}</span>
        <span className="pointer-state-value warning">{pair[1]} <b>{step[pair[1]]}</b></span>
      </>}
      {partitions && <span className="pointer-state-value success">cut A/B <b>{step.partitionA ?? '—'} / {step.partitionB ?? '—'}</b></span>}
      {direction && <span className="pointer-state-direction">{direction}</span>}
    </div>
  )
}
