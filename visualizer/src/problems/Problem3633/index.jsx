import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function RideTimeline({ run, step }) {
  const { landStartTime: ls, landDuration: ld, waterStartTime: ws, waterDuration: wd } = run.input
  const ends = [...ls.map((s, i) => s + ld[i]), ...ws.map((s, i) => s + wd[i])]
  const max = Math.max(1, ...ends)
  const W = 520, scale = v => (v / max) * (W - 40) + 20
  const bar = (y, start, dur, label, on) => <g>
    <rect x={scale(start)} y={y} width={Math.max(2, scale(start + dur) - scale(start))} height={18} rx={3}
      fill={on ? 'var(--primary)' : 'var(--surface2)'} stroke="var(--text)" />
    <text x={scale(start) + 4} y={y + 13} fontSize="11" fill="var(--text)">{label}</text>
  </g>
  return <svg viewBox={`0 0 ${W} 80`} role="img" aria-label="Timeline of the chosen land and water rides" style={{ width: '100%', maxWidth: W }}>
    {ls.map((s, i) => bar(8, s, ld[i], `L${i}`, step.land === i))}
    {ws.map((s, i) => bar(44, s, wd[i], `W${i}`, step.water === i))}
  </svg>
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No finish time has been found yet.' },
    { id: 'pair', label: 'Pair', description: 'Choose one land ride and one water ride.' },
    { id: 'land-first', label: 'Land first', description: 'Run the land ride, then the water ride.' },
    { id: 'water-first', label: 'Water first', description: 'Run the water ride, then the land ride.' },
    { id: 'keep', label: 'Keep', description: 'Keep the smallest finish time.' },
    { id: 'done', label: 'Result', description: 'Report the earliest finish time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with landStartTime, landDuration, waterStartTime and waterDuration',
  url: 'https://leetcode.com/problems/earliest-finish-time-for-land-and-water-rides-i/',
  complexity: 'O(n * m) time for n land rides and m water rides, with constant work per pair.',
  examples: [
    { label: 'Own case 1', input: '{"landStartTime":[3,9],"landDuration":[5,2],"waterStartTime":[7],"waterDuration":[4]}' },
    { label: 'Own case 2', input: '{"landStartTime":[6],"landDuration":[4],"waterStartTime":[2],"waterDuration":[11]}' },
    { label: 'One ride each', input: '{"landStartTime":[2],"landDuration":[3],"waterStartTime":[4],"waterDuration":[1]}' },
    { label: 'Equal start times', input: '{"landStartTime":[5,5],"landDuration":[2,2],"waterStartTime":[5],"waterDuration":[2]}' },
    { label: 'Largest values', input: '{"landStartTime":[1000],"landDuration":[1000],"waterStartTime":[1,1000],"waterDuration":[1000,1]}' },
    { label: 'Long run: 5 rides each', input: '{"landStartTime":[298,460,436,468,717],"landDuration":[250,375,388,350,877],"waterStartTime":[553,955,311,352,479],"waterDuration":[59,702,863,588,986]}' },
  ],
}

export default function EarliestFinishTimeRidesI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RideTimeline run={run} step={step} />
    <output aria-label="Ride pair">{`land ${step.land >= 0 ? step.land : 'none'}, water ${step.water >= 0 ? step.water : 'none'}`}</output>
    <output aria-label="Best finish">{`best = ${Number.isFinite(step.best) ? step.best : 'infinity'}`}</output>
  </>} renderReasoning={() => <>
    <p>Both rides must be used, and either one can go first. Waiting is allowed, so each ride starts at the later of its own start time and the moment the previous ride ends.</p>
    <p>Trying every land and water pair in both orders covers every plan, and the smallest finish time is the answer.</p>
  </>} />
}
